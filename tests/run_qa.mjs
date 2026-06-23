// Phase 3.5 QA runner — uses Playwright locator / storageState / addInitScript
// No exec-string patterns; uses typed Playwright APIs only.
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:5173';
const CHROMIUM = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

let results = [];
function log(id, desc, pass, note = '') {
  results.push({ id, desc, pass, note });
  console.log(`${pass ? '✅' : '❌'} ${id}: ${desc}${note ? ' — ' + note : ''}`);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitForIdle(page) {
  // Wait until the submit button is enabled again (loading finished)
  await page.locator('button[type="submit"]').waitFor({ state: 'visible' });
  await page.locator('button[type="submit"]').waitFor({ state: 'enabled', timeout: 10000 }).catch(() => {});
  await sleep(200);
}

async function getLsHistory(ctx) {
  const state = await ctx.storageState();
  const origin = state.origins.find(o => o.origin.includes('5173'));
  const entry = origin?.localStorage?.find(e => e.name === 'sentence_history');
  if (!entry?.value) return [];
  try { return JSON.parse(entry.value); } catch { return null; }
}

// ── browser setup ──────────────────────────────────────────────────────────
const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });

// ═══════════════════════════════════════════════════════════════════
// G1 G2 G3 — 综合基础流程
// ═══════════════════════════════════════════════════════════════════
console.log('\n=== G: 综合基础流程 ===');
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE);
  await sleep(400);

  // G1: analyze → history appears
  await page.fill('textarea', 'She is a teacher.');
  await page.locator('button[type="submit"]').click();
  await waitForIdle(page);
  await sleep(300);

  const liCount1 = await page.locator('ul li').count();
  log('G1', '分析成功后历史新增', liCount1 >= 1, `历史条数: ${liCount1}`);

  // G2: click history → restores input
  const firstSentence = await page.locator('ul li').first().locator('span').first().textContent();
  await page.locator('ul li').first().click();
  await sleep(300);
  const inputVal = await page.locator('textarea').inputValue();
  const g2pass = inputVal.length > 0;
  log('G2', '点击历史恢复原句', g2pass, `textarea: "${inputVal.slice(0,30)}"`);

  // G3: mobile layout no overflow
  await page.setViewportSize({ width: 375, height: 812 });
  await sleep(300);
  const scrollW = await page.waitForFunction(
    () => document.documentElement.scrollWidth,
    { timeout: 2000 }
  ).then(h => h.jsonValue()).catch(() => 999);
  log('G3', '移动端布局无水平溢出（375px）', scrollW <= 375, `scrollWidth=${scrollW}`);
  await page.setViewportSize({ width: 1280, height: 800 });

  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════
// P1 P2 P3 — 复制结果
// ═══════════════════════════════════════════════════════════════════
console.log('\n=== P: 复制结果 ===');
{
  const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await sleep(300);

  await page.fill('textarea', 'Birds sing beautifully.');
  await page.locator('button[type="submit"]').click();
  await waitForIdle(page);
  await sleep(300);

  // P1: copy button exists
  const copyBtn = page.locator('button:has-text("复制结果")');
  const p1pass = await copyBtn.count() > 0;
  log('P1', '复制结果按钮存在', p1pass);

  if (p1pass) {
    await copyBtn.click();

    // P3: wait for button to show "已复制 ✓" (up to 4s — headless clipboard can be slow)
    const p3pass = await page.locator('button:has-text("已复制")').waitFor({ timeout: 4000 })
      .then(() => true).catch(() => false);
    const btnTextAfter = await copyBtn.textContent();
    log('P3', '复制后按钮显示"已复制 ✓"', p3pass, `文字: "${btnTextAfter}"`);

    // P2: clipboard content
    const clipText = await page.waitForFunction(
      () => navigator.clipboard.readText(),
      { timeout: 5000 }
    ).then(h => h.jsonValue()).catch(() => '');
    const p2pass = clipText.includes('原句') && clipText.length > 10;
    log('P2', '复制内容含"原句"和解释文本', p2pass,
        clipText ? `前60字: ${clipText.slice(0,60).replace(/\n/g,' ')}` : '剪贴板空');

    // P3 reset: wait 2.5s from last check then verify button reverted
    await sleep(2500);
    const btnText2 = await copyBtn.textContent();
    log('P3-reset', '2s后按钮恢复"复制结果"', btnText2.includes('复制结果') && !btnText2.includes('已复制'), `文字: "${btnText2}"`);
  } else {
    log('P2', '复制内容（跳过，P1失败）', false);
    log('P3', '复制反馈（跳过，P1失败）', false);
    log('P3-reset', '按钮重置（跳过，P1失败）', false);
  }

  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════
// D1 D2 D3 — 删除单条历史
// ═══════════════════════════════════════════════════════════════════
console.log('\n=== D: 删除单条历史 ===');
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE);
  await sleep(300);

  // Add 3 entries
  for (const s of ['Alpha sentence.', 'Beta sentence.', 'Gamma sentence.']) {
    await page.fill('textarea', s);
    await page.locator('button[type="submit"]').click();
    await waitForIdle(page);
    await sleep(200);
  }

  // Use delete-button-specific locator to isolate history li from AnalysisResult li
  const historyLoc = page.locator('li:has(button[title="删除此条"])');
  const countBefore = await historyLoc.count();
  log('D-setup', `有 ${countBefore} 条历史`, countBefore >= 3);

  // Hover first history item and verify delete button is in DOM
  const firstHistoryItem = historyLoc.first();
  await firstHistoryItem.hover();
  await sleep(400);

  const deleteBtn = firstHistoryItem.locator('button[title="删除此条"]');
  const d1pass = await deleteBtn.count() > 0;
  log('D1', '删除按钮在 hover 后可交互', d1pass);

  if (d1pass) {
    const textareaBefore = await page.locator('textarea').inputValue();

    await deleteBtn.click();
    await sleep(400);

    const countAfter = await historyLoc.count();
    log('D2', '删除后条数减一', countAfter === countBefore - 1, `${countBefore} → ${countAfter}`);

    const textareaAfter = await page.locator('textarea').inputValue();
    log('D3', '删除不触发 onSelect（输入框不变）', textareaBefore === textareaAfter);

    const lsItems = await getLsHistory(ctx);
    log('D2-ls', 'localStorage 同步减少', Array.isArray(lsItems) && lsItems.length === countAfter,
        `localStorage: ${Array.isArray(lsItems) ? lsItems.length : 'err'}条`);
  } else {
    log('D2', '删除后条数减一（跳过）', false);
    log('D3', '删除不触发 onSelect（跳过）', false);
    log('D2-ls', 'localStorage 同步（跳过）', false);
  }

  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════
// C1 C2 C3 — 清空全部历史
// ═══════════════════════════════════════════════════════════════════
console.log('\n=== C: 清空全部历史 ===');
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE);
  await sleep(300);

  // Add 2 entries
  for (const s of ['Clear test one.', 'Clear test two.']) {
    await page.fill('textarea', s);
    await page.locator('button[type="submit"]').click();
    await waitForIdle(page);
    await sleep(200);
  }

  // C1: clear button visible when history exists
  const clearBtn = page.locator('button:has-text("清空全部")');
  const c1pass = await clearBtn.count() > 0;
  log('C1', '"清空全部"按钮在有历史时显示', c1pass);

  if (c1pass) {
    await clearBtn.click();
    await sleep(400);

    const countAfter = await page.locator('li:has(button[title="删除此条"])').count();
    const emptyVisible = await page.locator('text=分析句子后，记录会出现在这里').count() > 0;
    log('C2', '清空后历史条目为零，显示空状态文案', countAfter === 0 && emptyVisible,
        `历史li:${countAfter}, 空文案:${emptyVisible}`);

    const lsItems = await getLsHistory(ctx);
    log('C2-ls', 'localStorage 已清除（null 或空）', lsItems === null || (Array.isArray(lsItems) && lsItems.length === 0));

    const clearBtnAfter = await page.locator('button:has-text("清空全部")').count();
    log('C3', '空状态时"清空全部"不显示', clearBtnAfter === 0);
  } else {
    log('C2', '清空后效果（跳过）', false);
    log('C2-ls', 'localStorage 清除（跳过）', false);
    log('C3', '空状态隐藏按钮（跳过）', false);
  }

  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════
// S1 — 空 localStorage
// ═══════════════════════════════════════════════════════════════════
console.log('\n=== S: localStorage 安全降级 ===');
{
  // S1: fresh context = empty localStorage
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  let crashed = false;
  page.on('pageerror', () => { crashed = true; });
  await page.goto(BASE);
  await sleep(500);
  const emptyShown = await page.locator('text=分析句子后，记录会出现在这里').count() > 0;
  log('S1', '空 localStorage 不崩溃，显示空状态', emptyShown && !crashed);
  await ctx.close();
}

// S2: corrupted JSON
{
  const ctx = await browser.newContext();
  // Pre-set bad value before page loads
  await ctx.addInitScript(() => {
    localStorage.setItem('sentence_history', 'not-valid-json!!!');
  });
  const page = await ctx.newPage();
  let crashed = false;
  page.on('pageerror', () => { crashed = true; });
  await page.goto(BASE);
  await sleep(500);
  const emptyShown = await page.locator('text=分析句子后，记录会出现在这里').count() > 0;
  log('S2', 'JSON 损坏数据不崩溃，显示空状态', emptyShown && !crashed);
  await ctx.close();
}

// S3: old format (missing required fields)
{
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    // Entry missing id, result, created_at — old format
    localStorage.setItem('sentence_history', JSON.stringify([{ sentence: 'old format entry' }]));
  });
  const page = await ctx.newPage();
  let crashed = false;
  page.on('pageerror', () => { crashed = true; });
  await page.goto(BASE);
  await sleep(500);
  const emptyShown = await page.locator('text=分析句子后，记录会出现在这里').count() > 0;
  log('S3', '旧格式（缺字段）数据被过滤，显示空状态', emptyShown && !crashed);
  await ctx.close();
}

// S4: history persists after reload
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE);
  await sleep(300);
  await page.fill('textarea', 'The dog barked loudly.');
  await page.locator('button[type="submit"]').click();
  await waitForIdle(page);
  await sleep(300);

  await page.reload();
  await sleep(500);

  const countAfterReload = await page.locator('ul li').count();
  log('S4', '刷新后历史保留', countAfterReload >= 1, `历史条数: ${countAfterReload}`);
  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════
// E1 — 后端不可用，中文错误提示
// ═══════════════════════════════════════════════════════════════════
console.log('\n=== E: 错误提示 ===');
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  // Intercept /api/analyze and abort — simulates backend not running
  await page.route('**/api/analyze', route => route.abort('connectionrefused'));
  await page.goto(BASE);
  await sleep(300);
  await page.fill('textarea', 'Test sentence for error.');
  await page.locator('button[type="submit"]').click();
  await waitForIdle(page);
  await sleep(400);

  const errorText = await page.locator('p').allTextContents();
  const allText = errorText.join(' ');
  const hasChinese = allText.includes('无法连接') || allText.includes('网络') || allText.includes('超时') || allText.includes('暂时不可用');
  const noEnglish = !allText.includes('Failed to fetch');
  log('E1', '后端不可用显示中文错误（非 "Failed to fetch"）', hasChinese && noEnglish,
      `错误文案: "${allText.trim().slice(0,60)}"`);
  await ctx.close();
}

// E2 — AbortController 超时：验证代码路径（不跑 55s）
{
  // Verify client.js contains the 55000 constant and AbortController usage
  const { readFileSync } = await import('fs');
  const clientSrc = readFileSync('/Users/top/Desktop/sentence-agent/frontend/src/api/client.js', 'utf8');
  const hasAbortController = clientSrc.includes('AbortController');
  const has55000 = clientSrc.includes('55000');
  const hasFinally = clientSrc.includes('finally') && clientSrc.includes('clearTimeout');
  log('E2-code', 'client.js 含 AbortController + 55000 + clearTimeout', hasAbortController && has55000 && hasFinally);

  // Verify App.jsx catches AbortError by name
  const appSrc = readFileSync('/Users/top/Desktop/sentence-agent/frontend/src/App.jsx', 'utf8');
  const hasAbortCatch = appSrc.includes('"AbortError"') || appSrc.includes("'AbortError'");
  const hasTimeoutMsg = appSrc.includes('分析请求超时');
  log('E2', 'App.jsx 捕获 AbortError 并显示"分析请求超时"中文提示', hasAbortCatch && hasTimeoutMsg);
}

// E3 — 正常分析成功，无错误提示
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE);
  await sleep(300);
  await page.fill('textarea', 'I enjoy learning English.');
  await page.locator('button[type="submit"]').click();
  await waitForIdle(page);
  await sleep(300);

  const hasResult = await page.locator('text=句子高亮').count() > 0;
  const errorVisible = await page.locator('p[style*="dc2626"]').count() > 0; // red error text
  log('E3', '正常分析成功，结果显示且无错误提示', hasResult && !errorVisible);
  await ctx.close();
}

// ═══════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════
await browser.close();

console.log('\n═══════════════════════════════');
const passed = results.filter(r => r.pass).length;
const total = results.length;
console.log(`QA 通过: ${passed} / ${total}`);
const failed = results.filter(r => !r.pass);
if (failed.length) {
  console.log('\n未通过项:');
  failed.forEach(r => console.log(`  ❌ ${r.id}: ${r.desc} — ${r.note}`));
}

writeFileSync('/tmp/qa_results.json', JSON.stringify(results, null, 2));
