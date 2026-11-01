# StudyQ 录制分镜清单 · Kiroween 2026

对照 `docs/VIDEO_SCRIPT.md`。**总时长 ≤ 170 秒**。语言：普通话口播。线上演示：https://study-q-mu.vercel.app

---

## 录前准备

- [ ] 浏览器只开演示页 +（可选）GitHub 仓库页；关掉无关标签与通知
- [ ] 页面缩放约 **110–125%**，保证 Notes / Framework / Review 清晰可读
- [ ] 准备好一段 **示例笔记**（课本章节或自写短文，约 150–300 字），一键粘贴
- [ ] 清空或重置本机 `localStorage`（可选），避免旧卡片干扰
- [ ] 麦克风测试；口播可对照脚本，但录屏时说 **下面「口播要点」一行版**
- [ ] **禁止**版权音乐、第三方商标特写、未授权素材
- [ ] 勿在画面中露出 API 密钥、个人邮箱登录态敏感信息

---

## 分镜（按拍）

| 拍 | 计时 | 画面要给什么 | 口播要点（一行） |
|----|------|--------------|------------------|
| 0 开场钩子 | **0:00–0:15 · 15s** | 打开 https://study-q-mu.vercel.app ，停在 **Notes** | 笔记散乱→StudyQ 流水线：笔记→重点→框架→复习；Kiroween Frankenstein |
| 1 问题定位 | **0:15–0:35 · 20s** | 仍在 Notes；点一下输入区或示意示例标题 | LLM 抽重点 + 树状框架 + SM-2 闪卡拼成一套；无密钥也能 mock |
| 2 Notes | **0:35–1:05 · 30s** | 粘贴笔记 → 点 **Generate study pack** → 等结果出来 | `/api/generate`：有密钥走 OpenAI，没有走 mock，演示必通 |
| 3 Framework | **1:05–1:35 · 30s** | 切 **Framework**；展开/折叠几层树；扫一眼 key points | 可折叠概念树 + 关键点，锚定刚才那份笔记 |
| 4 Review | **1:35–2:05 · 30s** | 切 **Review**；翻卡看正反；点 Again/Hard/Good/Easy；（可选）刷新证明还在 | SM-2 风格；进度在 localStorage，MVP 无数据库 |
| 5 Kiro 痕迹 | **2:05–2:25 · 20s** | GitHub 或本地打开仓库根目录 **`.kiro/`**（steering / specs/study-core / hooks），短暂即可 | Kiro CLI：steering、EARS 规格、保存时 tsc hook；详见 KIRO_USAGE |
| 6 CTA | **2:25–2:50 · 25s** | 再回 https://study-q-mu.vercel.app ；可叠字幕：仓库 + #KiroweenHackathon26 | 线上 study-q-mu.vercel.app；GitHub dingba809/studyQ MIT；Bo Zhou 单人 Frankenstein；谢谢 |

**合计：170s。** 各段可微调，但总长不得超过 170 秒。

---

## 必须露出的画面（核对）

- [ ] Live URL：`https://study-q-mu.vercel.app`
- [ ] 三标签实操：**Notes → Framework → Review**
- [ ] 短暂展示 **`.kiro`** 目录（勿泄露密钥）
- [ ] （建议）结尾仓库链接 `https://github.com/dingba809/studyQ`

---

## 上传前最终检查

- [ ] 成片总长 **≤ 170 秒**（建议导出后看一眼时间码）
- [ ] Notes → Framework → Review 都有清晰操作，不是空口说
- [ ] 提到 Kiro / `.kiro` 时 **不虚构** 未使用的能力（IDE / Crew / MCP 等）
- [ ] 无版权音乐、无未授权商标
- [ ] 画面与口播无密钥、无敏感隐私
- [ ] 文件已保存；字幕可选但不是必须
- [ ] **YouTube：上传后设为公开前，必须等用户口头/文字 CONFIRM**（本清单不代替发布确认；代理不得擅自点公开）

上传与公开步骤留给人工确认后再做。
