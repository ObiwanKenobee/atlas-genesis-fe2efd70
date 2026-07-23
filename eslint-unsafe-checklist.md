# no-unsafe-* Prioritized Checklist

Generated: 2026-07-03T07:56:44.988Z
Total `no-unsafe-*` warnings: **1044** across **107** files.

Tackle files top-to-bottom; each file's fixes drop the total by the listed score.

## Top 30 files by impact

| # | File | Score | Breakdown |
| ---: | --- | ---: | --- |
| 1 | `src/lib/reporting/exportManager.ts` | 79 | no-unsafe-member-access:42, no-unsafe-assignment:25, no-unsafe-argument:7, no-unsafe-return:5 |
| 2 | `src/hooks/useUserData.ts` | 65 | no-unsafe-member-access:33, no-unsafe-assignment:19, no-unsafe-return:12, no-unsafe-call:1 |
| 3 | `src/components/UnifiedInnovationDashboard.tsx` | 41 | no-unsafe-assignment:24, no-unsafe-member-access:15, no-unsafe-call:2 |
| 4 | `src/lib/TemporalEngine.ts` | 38 | no-unsafe-member-access:27, no-unsafe-assignment:8, no-unsafe-return:3 |
| 5 | `src/pages/TransactionHistory.tsx` | 38 | no-unsafe-member-access:26, no-unsafe-call:9, no-unsafe-argument:3 |
| 6 | `src/hooks/usePortfolioAnalytics.ts` | 36 | no-unsafe-member-access:24, no-unsafe-argument:5, no-unsafe-return:4, no-unsafe-assignment:3 |
| 7 | `src/hooks/useNotifications.ts` | 35 | no-unsafe-member-access:25, no-unsafe-assignment:7, no-unsafe-call:3 |
| 8 | `src/hooks/usePortfolioIntelligence.ts` | 35 | no-unsafe-member-access:18, no-unsafe-assignment:13, no-unsafe-return:4 |
| 9 | `src/hooks/useAuditLogs.ts` | 31 | no-unsafe-member-access:15, no-unsafe-argument:9, no-unsafe-assignment:7 |
| 10 | `src/services/projectService.ts` | 27 | no-unsafe-return:17, no-unsafe-assignment:7, no-unsafe-member-access:3 |
| 11 | `src/pages/enterprise/APIKeyManagement.tsx` | 26 | no-unsafe-member-access:13, no-unsafe-assignment:9, no-unsafe-argument:4 |
| 12 | `src/services/paymentService.ts` | 25 | no-unsafe-return:12, no-unsafe-assignment:10, no-unsafe-member-access:2, no-unsafe-argument:1 |
| 13 | `src/components/analytics/AnalyticsDashboard.tsx` | 21 | no-unsafe-member-access:9, no-unsafe-assignment:5, no-unsafe-argument:5, no-unsafe-call:2 |
| 14 | `src/contexts/EnhancedAuthContext.tsx` | 21 | no-unsafe-argument:8, no-unsafe-member-access:8, no-unsafe-assignment:5 |
| 15 | `src/contexts/SubscriptionContext.tsx` | 19 | no-unsafe-member-access:10, no-unsafe-assignment:8, no-unsafe-argument:1 |
| 16 | `src/pages/enterprise/BillingDashboard.tsx` | 18 | no-unsafe-assignment:7, no-unsafe-member-access:7, no-unsafe-argument:4 |
| 17 | `src/services/investmentService.ts` | 18 | no-unsafe-return:12, no-unsafe-assignment:6 |
| 18 | `src/pages/enterprise/InvoicesManagement.tsx` | 17 | no-unsafe-assignment:7, no-unsafe-member-access:7, no-unsafe-argument:3 |
| 19 | `src/pages/enterprise/PaymentMethods.tsx` | 17 | no-unsafe-assignment:7, no-unsafe-member-access:7, no-unsafe-argument:3 |
| 20 | `src/services/adminConnector.ts` | 16 | no-unsafe-assignment:4, no-unsafe-argument:4, no-unsafe-member-access:4, no-unsafe-return:4 |
| 21 | `src/services/aiService.ts` | 16 | no-unsafe-member-access:7, no-unsafe-assignment:5, no-unsafe-return:4 |
| 22 | `src/hooks/useAuth.tsx` | 15 | no-unsafe-argument:7, no-unsafe-assignment:4, no-unsafe-member-access:4 |
| 23 | `src/lib/analysis/timeComplexity.ts` | 15 | no-unsafe-assignment:6, no-unsafe-return:5, no-unsafe-call:2, no-unsafe-member-access:2 |
| 24 | `src/lib/api/apiClient.ts` | 15 | no-unsafe-member-access:6, no-unsafe-assignment:5, no-unsafe-return:4 |
| 25 | `src/pages/Auth.tsx` | 15 | no-unsafe-assignment:7, no-unsafe-member-access:7, no-unsafe-call:1 |
| 26 | `src/lib/impact/simulation.ts` | 14 | no-unsafe-call:5, no-unsafe-member-access:5, no-unsafe-assignment:3, no-unsafe-return:1 |
| 27 | `src/pages/Settings.tsx` | 14 | no-unsafe-assignment:6, no-unsafe-member-access:6, no-unsafe-argument:2 |
| 28 | `src/lib/analytics.ts` | 13 | no-unsafe-member-access:8, no-unsafe-assignment:3, no-unsafe-call:2 |
| 29 | `src/lib/governance/MultiSpeciesGovernance.ts` | 13 | no-unsafe-member-access:9, no-unsafe-assignment:3, no-unsafe-argument:1 |
| 30 | `src/pages/Prototype.tsx` | 11 | no-unsafe-argument:4, no-unsafe-member-access:4, no-unsafe-assignment:2, no-unsafe-return:1 |

## Full checklist

### `src/lib/reporting/exportManager.ts` — 79 warning(s)

- [ ] L48:31 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `{}`.
- [ ] L54:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L54:29 `no-unsafe-member-access` — Unsafe member access [header] on an `any` value.
- [ ] L58:11 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L103:31 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L104:24 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L104:26 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L104:59 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L104:61 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L111:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L111:54 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L120:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L120:27 `no-unsafe-member-access` — Unsafe member access .totalValue on an `any` value.
- [ ] L121:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L121:29 `no-unsafe-member-access` — Unsafe member access .totalCredits on an `any` value.
- [ ] L122:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L122:32 `no-unsafe-member-access` — Unsafe member access .totalCarbonOffset on an `any` value.
- [ ] L123:36 `no-unsafe-member-access` — Unsafe member access .projectedAnnualImpact on an `any` value.
- [ ] L126:22 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L126:24 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L127:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L127:15 `no-unsafe-member-access` — Unsafe member access .transaction_type on an `any` value.
- [ ] L128:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L128:19 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L129:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L129:16 `no-unsafe-member-access` — Unsafe member access .price_per_credit on an `any` value.
- [ ] L130:17 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L130:37 `no-unsafe-member-access` — Unsafe member access .price_per_credit on an `any` value.
- [ ] L133:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L133:18 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L134:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L134:19 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L135:16 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L135:30 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L137:17 `no-unsafe-member-access` — Unsafe member access .totalCredits on an `any` value.
- [ ] L137:39 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L137:58 `no-unsafe-member-access` — Unsafe member access .totalCredits on an `any` value.
- [ ] L138:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L138:18 `no-unsafe-member-access` — Unsafe member access .retired on an `any` value.
- [ ] L153:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L153:23 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L156:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L156:23 `no-unsafe-member-access` — Unsafe member access .retired_at on an `any` value.
- [ ] L159:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L160:22 `no-unsafe-member-access` — Unsafe member access .transaction_type on an `any` value.
- [ ] L161:25 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L161:34 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L161:48 `no-unsafe-member-access` — Unsafe member access .price_per_credit on an `any` value.
- [ ] L163:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L164:22 `no-unsafe-member-access` — Unsafe member access .transaction_type on an `any` value.
- [ ] L165:25 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L165:34 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L165:48 `no-unsafe-member-access` — Unsafe member access .price_per_credit on an `any` value.
- [ ] L167:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L167:62 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L167:70 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L172:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L173:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L175:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L190:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L190:34 `no-unsafe-member-access` — Unsafe member access .totalCarbonOffset on an `any` value.
- [ ] L199:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L208:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L209:21 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L209:30 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L253:28 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L253:30 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L254:22 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L254:42 `no-unsafe-member-access` — Unsafe member access .price_per_credit on an `any` value.
- [ ] L256:49 `no-unsafe-member-access` — Unsafe member access .transaction_type on an `any` value.
- [ ] L283:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L283:21 `no-unsafe-member-access` — Unsafe member access .user_id on an `any` value.
- [ ] L284:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L284:26 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L285:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L285:23 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L291:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L291:22 `no-unsafe-member-access` — Unsafe member access .retired on an `any` value.
- [ ] L292:26 `no-unsafe-member-access` — Unsafe member access .retired on an `any` value.

### `src/hooks/useUserData.ts` — 65 warning(s)

- [ ] L74:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L75:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L75:25 `no-unsafe-member-access` — Unsafe member access .user on an `any` value.
- [ ] L76:16 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L78:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L78:19 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L79:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L79:22 `no-unsafe-member-access` — Unsafe member access .email on an `any` value.
- [ ] L80:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L80:28 `no-unsafe-member-access` — Unsafe member access .displayName on an `any` value.
- [ ] L80:45 `no-unsafe-member-access` — Unsafe member access .display_name on an `any` value.
- [ ] L80:61 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L80:63 `no-unsafe-member-access` — Unsafe member access .email on an `any` value.
- [ ] L80:81 `no-unsafe-member-access` — Unsafe member access [0] on an `any` value.
- [ ] L81:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L81:25 `no-unsafe-member-access` — Unsafe member access .fullName on an `any` value.
- [ ] L81:39 `no-unsafe-member-access` — Unsafe member access .full_name on an `any` value.
- [ ] L82:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L82:29 `no-unsafe-member-access` — Unsafe member access .organization on an `any` value.
- [ ] L83:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L83:21 `no-unsafe-member-access` — Unsafe member access .role on an `any` value.
- [ ] L84:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L84:30 `no-unsafe-member-access` — Unsafe member access .emailVerified on an `any` value.
- [ ] L84:49 `no-unsafe-member-access` — Unsafe member access .email_verified on an `any` value.
- [ ] L85:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L85:27 `no-unsafe-member-access` — Unsafe member access .mfaEnabled on an `any` value.
- [ ] L85:43 `no-unsafe-member-access` — Unsafe member access .mfa_enabled on an `any` value.
- [ ] L86:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L86:26 `no-unsafe-member-access` — Unsafe member access .avatarUrl on an `any` value.
- [ ] L86:41 `no-unsafe-member-access` — Unsafe member access .avatar_url on an `any` value.
- [ ] L87:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L87:24 `no-unsafe-member-access` — Unsafe member access .segment on an `any` value.
- [ ] L88:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L88:36 `no-unsafe-member-access` — Unsafe member access .onboardingCompleted on an `any` value.
- [ ] L88:61 `no-unsafe-member-access` — Unsafe member access .onboarding_completed on an `any` value.
- [ ] L89:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L89:26 `no-unsafe-member-access` — Unsafe member access .createdAt on an `any` value.
- [ ] L89:41 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L113:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L114:9 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L156:9 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L178:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L179:9 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L179:22 `no-unsafe-member-access` — Unsafe member access .preferences on an `any` value.
- [ ] L215:9 `no-unsafe-return` — Unsafe return of a value of type `any[]`.
- [ ] L227:9 `no-unsafe-return` — Unsafe return of a value of type `any[]`.
- [ ] L227:46 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L227:54 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L227:65 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L243:9 `no-unsafe-return` — Unsafe return of a value of type `any[]`.
- [ ] L254:9 `no-unsafe-return` — Unsafe return of a value of type `any[]`.
- [ ] L254:46 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L254:54 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L254:65 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L267:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L267:59 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L267:66 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L268:64 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L268:84 `no-unsafe-member-access` — Unsafe member access .purchase_price on an `any` value.
- [ ] L270:14 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L270:35 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L270:71 `no-unsafe-member-access` — Unsafe member access .co2_offset_per_credit on an `any` value.
- [ ] L271:53 `no-unsafe-member-access` — Unsafe member access .retired on an `any` value.
- [ ] L284:9 `no-unsafe-return` — Unsafe return of a value of type `any[]`.
- [ ] L308:9 `no-unsafe-return` — Unsafe return of a value of type `any`.

### `src/components/UnifiedInnovationDashboard.tsx` — 41 warning(s)

- [ ] L13:10 `no-unsafe-assignment` — Unsafe array destructuring of a tuple element with an `any` value.
- [ ] L14:10 `no-unsafe-assignment` — Unsafe array destructuring of a tuple element with an `any` value.
- [ ] L15:10 `no-unsafe-assignment` — Unsafe array destructuring of a tuple element with an `any` value.
- [ ] L16:10 `no-unsafe-assignment` — Unsafe array destructuring of a tuple element with an `any` value.
- [ ] L17:10 `no-unsafe-assignment` — Unsafe array destructuring of a tuple element with an `any` value.
- [ ] L50:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L53:35 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L53:56 `no-unsafe-member-access` — Unsafe member access .totalNodes on an `any` value.
- [ ] L54:34 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L54:41 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L54:55 `no-unsafe-member-access` — Unsafe member access .totalQubits on an `any` value.
- [ ] L55:36 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L55:57 `no-unsafe-member-access` — Unsafe member access .networkStatus on an `any` value.
- [ ] L62:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L65:37 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L65:61 `no-unsafe-member-access` — Unsafe member access .totalMembers on an `any` value.
- [ ] L66:32 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L66:56 `no-unsafe-member-access` — Unsafe member access .humanRepresentation on an `any` value.
- [ ] L67:29 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L67:53 `no-unsafe-member-access` — Unsafe member access .aiRepresentation on an `any` value.
- [ ] L74:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L77:35 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L77:56 `no-unsafe-member-access` — Unsafe member access .networkNodes on an `any` value.
- [ ] L78:36 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L78:43 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L78:57 `no-unsafe-member-access` — Unsafe member access .totalRegenCapacity on an `any` value.
- [ ] L79:28 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L79:49 `no-unsafe-member-access` — Unsafe member access .interplanetaryStatus on an `any` value.
- [ ] L86:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L89:40 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L89:67 `no-unsafe-member-access` — Unsafe member access .brainwaveChannels on an `any` value.
- [ ] L90:40 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L90:67 `no-unsafe-member-access` — Unsafe member access .ecosystemChannels on an `any` value.
- [ ] L91:63 `no-unsafe-member-access` — Unsafe member access .synchronizationLevel on an `any` value.
- [ ] L98:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L101:38 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L101:60 `no-unsafe-member-access` — Unsafe member access .activeTimelines on an `any` value.
- [ ] L102:36 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L102:58 `no-unsafe-member-access` — Unsafe member access .temporalRange on an `any` value.
- [ ] L103:43 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L103:65 `no-unsafe-member-access` — Unsafe member access .interventionCapacity on an `any` value.

### `src/lib/TemporalEngine.ts` — 38 warning(s)

- [ ] L48:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L49:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L55:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L56:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L75:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L79:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L95:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L98:26 `no-unsafe-member-access` — Unsafe member access .type on an `any` value.
- [ ] L100:18 `no-unsafe-member-access` — Unsafe member access .carbonLevels on an `any` value.
- [ ] L100:52 `no-unsafe-member-access` — Unsafe member access .intensity on an `any` value.
- [ ] L101:18 `no-unsafe-member-access` — Unsafe member access .biodiversityIndex on an `any` value.
- [ ] L101:57 `no-unsafe-member-access` — Unsafe member access .intensity on an `any` value.
- [ ] L104:18 `no-unsafe-member-access` — Unsafe member access .carbonLevels on an `any` value.
- [ ] L104:52 `no-unsafe-member-access` — Unsafe member access .intensity on an `any` value.
- [ ] L105:18 `no-unsafe-member-access` — Unsafe member access .ecosystemHealth on an `any` value.
- [ ] L105:55 `no-unsafe-member-access` — Unsafe member access .intensity on an `any` value.
- [ ] L108:18 `no-unsafe-member-access` — Unsafe member access .humanWellbeing on an `any` value.
- [ ] L108:54 `no-unsafe-member-access` — Unsafe member access .intensity on an `any` value.
- [ ] L109:18 `no-unsafe-member-access` — Unsafe member access .ecosystemHealth on an `any` value.
- [ ] L109:55 `no-unsafe-member-access` — Unsafe member access .intensity on an `any` value.
- [ ] L113:5 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L117:45 `no-unsafe-member-access` — Unsafe member access .year on an `any` value.
- [ ] L121:52 `no-unsafe-member-access` — Unsafe member access .carbonLevels on an `any` value.
- [ ] L122:35 `no-unsafe-member-access` — Unsafe member access .biodiversityIndex on an `any` value.
- [ ] L123:39 `no-unsafe-member-access` — Unsafe member access .ecosystemHealth on an `any` value.
- [ ] L124:37 `no-unsafe-member-access` — Unsafe member access .humanWellbeing on an `any` value.
- [ ] L148:5 `no-unsafe-return` — Unsafe return of a value of type error.
- [ ] L148:24 `no-unsafe-member-access` — Computed name [intervention.type] resolves to an `any` value.
- [ ] L148:37 `no-unsafe-member-access` — Unsafe member access .type on an `any` value.
- [ ] L162:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L163:41 `no-unsafe-member-access` — Unsafe member access .year on an `any` value.
- [ ] L166:16 `no-unsafe-member-access` — Unsafe member access .year on an `any` value.
- [ ] L167:16 `no-unsafe-member-access` — Unsafe member access .carbonLevels on an `any` value.
- [ ] L168:16 `no-unsafe-member-access` — Unsafe member access .biodiversityIndex on an `any` value.
- [ ] L170:5 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L195:22 `no-unsafe-member-access` — Unsafe member access .biodiversityIndex on an `any` value.
- [ ] L195:51 `no-unsafe-member-access` — Unsafe member access .ecosystemHealth on an `any` value.
- [ ] L195:78 `no-unsafe-member-access` — Unsafe member access .humanWellbeing on an `any` value.

### `src/pages/TransactionHistory.tsx` — 38 warning(s)

- [ ] L78:27 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string \| null>`.
- [ ] L78:39 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L85:31 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L86:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L86:37 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L87:11 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L87:23 `no-unsafe-member-access` — Unsafe member access .status on an `any` value.
- [ ] L92:24 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L93:9 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L93:21 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L94:25 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L94:59 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L99:25 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L100:22 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L100:34 `no-unsafe-member-access` — Unsafe member access .price_per_credit on an `any` value.
- [ ] L101:18 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L101:30 `no-unsafe-member-access` — Unsafe member access .total_amount on an `any` value.
- [ ] L102:31 `no-unsafe-member-access` — Unsafe member access .payment_method on an `any` value.
- [ ] L115:34 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L115:46 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L140:23 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L142:29 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L142:49 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L146:15 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L146:23 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L147:12 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L147:12 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L147:20 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L147:61 `no-unsafe-member-access` — Unsafe member access .padEnd on an `any` value.
- [ ] L148:25 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L148:60 `no-unsafe-member-access` — Unsafe member access .project on an `any` value.
- [ ] L150:30 `no-unsafe-member-access` — Unsafe member access .certificate_id on an `any` value.
- [ ] L150:56 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L151:34 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L151:42 `no-unsafe-member-access` — Unsafe member access .retired_at on an `any` value.
- [ ] L151:64 `no-unsafe-member-access` — Unsafe member access .purchased_at on an `any` value.
- [ ] L167:38 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L167:46 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.

### `src/hooks/usePortfolioAnalytics.ts` — 36 warning(s)

- [ ] L94:29 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L94:32 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L95:26 `no-unsafe-member-access` — Unsafe member access .total_amount on an `any` value.
- [ ] L96:28 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L97:24 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L97:39 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L120:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L120:27 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L121:36 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L122:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L122:17 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L123:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L123:17 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L128:26 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L128:39 `no-unsafe-member-access` — Unsafe member access .purchase_price on an `any` value.
- [ ] L129:28 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L130:20 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L166:15 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L166:28 `no-unsafe-member-access` — Unsafe member access .purchase_price on an `any` value.
- [ ] L168:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L168:15 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L170:15 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L170:29 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L176:15 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L176:29 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L176:68 `no-unsafe-member-access` — Unsafe member access .purchase_price on an `any` value.
- [ ] L187:16 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L187:18 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L189:16 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L189:18 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L192:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L192:15 `no-unsafe-member-access` — Unsafe member access .total_amount on an `any` value.
- [ ] L194:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L194:15 `no-unsafe-member-access` — Unsafe member access .total_amount on an `any` value.
- [ ] L196:57 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L196:59 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.

### `src/hooks/useNotifications.ts` — 35 warning(s)

- [ ] L86:28 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L89:25 `no-unsafe-member-access` — Unsafe member access .status on an `any` value.
- [ ] L89:91 `no-unsafe-member-access` — Unsafe member access .status on an `any` value.
- [ ] L90:30 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L90:58 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L90:108 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L90:111 `no-unsafe-member-access` — Unsafe member access .total_amount on an `any` value.
- [ ] L94:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L94:30 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L95:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L95:30 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L96:45 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L96:60 `no-unsafe-member-access` — Unsafe member access .total_amount on an `any` value.
- [ ] L113:34 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L117:33 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L117:80 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L117:86 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L117:142 `no-unsafe-member-access` — Unsafe member access .direction on an `any` value.
- [ ] L117:194 `no-unsafe-member-access` — Unsafe member access .target_price on an `any` value.
- [ ] L121:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L121:33 `no-unsafe-member-access` — Unsafe member access .triggered_at on an `any` value.
- [ ] L121:55 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L122:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L122:33 `no-unsafe-member-access` — Unsafe member access .triggered_at on an `any` value.
- [ ] L122:55 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L148:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L150:26 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L154:28 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L154:61 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L154:64 `no-unsafe-member-access` — Unsafe member access .total_amount on an `any` value.
- [ ] L158:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L158:28 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L159:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L159:28 `no-unsafe-member-access` — Unsafe member access .created_at on an `any` value.
- [ ] L252:49 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/hooks/usePortfolioIntelligence.ts` — 35 warning(s)

- [ ] L85:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L86:21 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L86:29 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L86:42 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L89:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L89:56 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L89:64 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L91:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L92:21 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L92:29 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L92:43 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L99:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L99:24 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L100:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L100:26 `no-unsafe-member-access` — Computed name [type] resolves to an `any` value.
- [ ] L100:52 `no-unsafe-member-access` — Computed name [type] resolves to an `any` value.
- [ ] L100:68 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L137:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L138:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L140:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L155:58 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L155:60 `no-unsafe-member-access` — Unsafe member access .project_id on an `any` value.
- [ ] L159:43 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L277:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L277:24 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L278:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L278:21 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L279:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L279:26 `no-unsafe-member-access` — Unsafe member access .purchase_price on an `any` value.
- [ ] L280:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L280:25 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L281:18 `no-unsafe-member-access` — Unsafe member access .quantity on an `any` value.
- [ ] L281:31 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L282:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L282:20 `no-unsafe-member-access` — Unsafe member access .retired on an `any` value.

### `src/hooks/useAuditLogs.ts` — 31 warning(s)

- [ ] L80:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L82:18 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L83:17 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<AuditLog[]>`.
- [ ] L83:24 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L85:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L85:32 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L112:10 `no-unsafe-assignment` — Unsafe array destructuring of a tuple element with an `any` value.
- [ ] L137:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L139:18 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L140:24 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L142:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L142:32 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L156:12 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L188:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L190:18 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L191:17 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<any[]>`.
- [ ] L191:24 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L193:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L193:32 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L239:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L241:18 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L242:17 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<any[]>`.
- [ ] L242:24 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L244:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L244:32 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L291:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L293:18 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L294:17 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<any[]>`.
- [ ] L294:24 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L296:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L296:32 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.

### `src/services/projectService.ts` — 27 warning(s)

- [ ] L19:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L25:23 `no-unsafe-member-access` — Unsafe member access .__atlasAccessToken on an `any` value.
- [ ] L37:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L38:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L38:31 `no-unsafe-member-access` — Unsafe member access .access_token on an `any` value.
- [ ] L38:55 `no-unsafe-member-access` — Unsafe member access .currentSession on an `any` value.
- [ ] L250:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L252:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L274:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L276:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L294:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L296:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L314:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L317:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L359:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L401:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L418:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L437:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L449:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L470:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L490:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L511:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L530:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L551:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L563:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L577:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L596:7 `no-unsafe-return` — Unsafe return of a value of type `any`.

### `src/pages/enterprise/APIKeyManagement.tsx` — 26 warning(s)

- [ ] L89:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L90:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L91:20 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<APIKey[]>`.
- [ ] L91:25 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L121:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L122:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L130:22 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string \| null>`.
- [ ] L130:27 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L131:50 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L131:55 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L135:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L135:29 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L160:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L161:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L170:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L170:29 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L195:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L196:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L205:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L205:29 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L226:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L227:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L228:22 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<APIKeyUsage \| null>`.
- [ ] L228:27 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L233:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L233:29 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.

### `src/services/paymentService.ts` — 25 warning(s)

- [ ] L27:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L207:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L232:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L233:34 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L233:47 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L262:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L278:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L279:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L299:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L301:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L320:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L322:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L343:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L344:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L344:31 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L347:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L427:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L429:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L490:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L502:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L503:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L525:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L540:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L565:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L604:7 `no-unsafe-return` — Unsafe return of a value of type `any`.

### `src/components/analytics/AnalyticsDashboard.tsx` — 21 warning(s)

- [ ] L312:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L313:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L315:27 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L316:24 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<DashboardTemplate[]>`.
- [ ] L316:38 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L317:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L318:15 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L318:29 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L319:15 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L319:29 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L320:31 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<DashboardTemplate \| null>`.
- [ ] L320:57 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L323:25 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L324:33 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<PerformanceMetric[]>`.
- [ ] L324:45 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L344:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L344:52 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L401:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L402:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L404:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| URL \| undefined`.
- [ ] L404:26 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.

### `src/contexts/EnhancedAuthContext.tsx` — 21 warning(s)

- [ ] L82:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L83:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L85:19 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<User \| null>`.
- [ ] L86:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<Tokens \| null>`.
- [ ] L87:31 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L87:44 `no-unsafe-member-access` — Unsafe member access .accessToken on an `any` value.
- [ ] L91:51 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `UserRole`.
- [ ] L91:62 `no-unsafe-member-access` — Unsafe member access .role on an `any` value.
- [ ] L97:67 `no-unsafe-member-access` — Unsafe member access .role on an `any` value.
- [ ] L104:30 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<DemoUserConfig \| undefined>`.
- [ ] L202:17 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<User \| null>`.
- [ ] L204:38 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L204:57 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L212:49 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `UserRole`.
- [ ] L212:68 `no-unsafe-member-access` — Unsafe member access .role on an `any` value.
- [ ] L218:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L218:38 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L514:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L516:20 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L517:50 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L517:68 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.

### `src/contexts/SubscriptionContext.tsx` — 19 warning(s)

- [ ] L65:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L67:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L67:32 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L69:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L69:20 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L70:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L70:24 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L71:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L71:26 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L72:33 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L72:38 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L73:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L73:24 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L74:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L74:36 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L75:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L75:34 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L76:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L76:35 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.

### `src/pages/enterprise/BillingDashboard.tsx` — 18 warning(s)

- [ ] L193:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L194:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<Subscription \| null>`.
- [ ] L194:33 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L199:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L200:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<Invoice[]>`.
- [ ] L200:29 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L205:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L206:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<Payment[]>`.
- [ ] L206:29 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L211:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L212:19 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<BillingAlert[]>`.
- [ ] L212:29 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L243:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L244:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L278:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L279:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L336:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L337:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.

### `src/services/investmentService.ts` — 18 warning(s)

- [ ] L16:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L309:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L311:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L330:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L332:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L351:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L386:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L388:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L400:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L412:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L426:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L456:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L458:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L470:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L482:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L483:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L497:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L513:7 `no-unsafe-return` — Unsafe return of a value of type `any`.

### `src/pages/enterprise/InvoicesManagement.tsx` — 17 warning(s)

- [ ] L173:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L174:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<Invoice[]>`.
- [ ] L174:29 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L179:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L180:28 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<InvoiceSettings \| null>`.
- [ ] L180:41 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L185:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L186:23 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<InvoiceStatistics \| null>`.
- [ ] L186:33 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L240:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L241:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L270:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L271:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L297:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L298:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L325:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L326:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.

### `src/pages/enterprise/PaymentMethods.tsx` — 17 warning(s)

- [ ] L184:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L185:27 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<PaymentMethod[]>`.
- [ ] L185:39 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L190:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L191:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<Payment[]>`.
- [ ] L191:34 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L196:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L197:23 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<PaymentStatistics \| null>`.
- [ ] L197:33 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L231:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L232:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L269:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L270:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L297:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L298:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L326:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L327:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.

### `src/services/adminConnector.ts` — 16 warning(s)

- [ ] L53:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L54:23 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L54:29 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L57:5 `no-unsafe-return` — Unsafe return of a value of type `Promise<any>`.
- [ ] L99:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L100:19 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| null`.
- [ ] L100:26 `no-unsafe-member-access` — Unsafe member access .token on an `any` value.
- [ ] L101:5 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L109:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L110:19 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| null`.
- [ ] L110:26 `no-unsafe-member-access` — Unsafe member access .token on an `any` value.
- [ ] L111:5 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L131:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L132:19 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| null`.
- [ ] L132:26 `no-unsafe-member-access` — Unsafe member access .token on an `any` value.
- [ ] L133:5 `no-unsafe-return` — Unsafe return of a value of type `any`.

### `src/services/aiService.ts` — 16 warning(s)

- [ ] L84:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L130:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L131:36 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L132:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L132:19 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L161:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L162:36 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L163:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L163:19 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L186:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L187:36 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L188:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L188:19 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L206:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L207:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L207:19 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.

### `src/hooks/useAuth.tsx` — 15 warning(s)

- [ ] L63:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L64:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L64:34 `no-unsafe-member-access` — Unsafe member access .tokens on an `any` value.
- [ ] L66:33 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L67:34 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| null`.
- [ ] L68:23 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<Tokens \| null>`.
- [ ] L68:28 `no-unsafe-member-access` — Unsafe member access .tokens on an `any` value.
- [ ] L77:23 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L78:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<User \| null>`.
- [ ] L95:19 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<User \| null>`.
- [ ] L130:17 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<User \| null>`.
- [ ] L249:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L251:20 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L252:35 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L252:44 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.

### `src/lib/analysis/timeComplexity.ts` — 15 warning(s)

- [ ] L52:5 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L52:64 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L91:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L95:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L95:20 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L95:35 `no-unsafe-member-access` — Unsafe member access .apply on an `any` value.
- [ ] L101:5 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L112:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L116:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L116:14 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L116:29 `no-unsafe-member-access` — Unsafe member access .apply on an `any` value.
- [ ] L145:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L155:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L159:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L163:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.

### `src/lib/api/apiClient.ts` — 15 warning(s)

- [ ] L7:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L18:38 `no-unsafe-member-access` — Unsafe member access .__atlasAccessToken on an `any` value.
- [ ] L30:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L31:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L32:19 `no-unsafe-member-access` — Unsafe member access .access_token on an `any` value.
- [ ] L33:19 `no-unsafe-member-access` — Unsafe member access .currentSession on an `any` value.
- [ ] L34:20 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L47:21 `no-unsafe-member-access` — Unsafe member access .__atlasAccessToken on an `any` value.
- [ ] L96:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L97:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L97:22 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L97:38 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L113:9 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L115:7 `no-unsafe-return` — Unsafe return of a value of type `Promise<any>`.
- [ ] L324:5 `no-unsafe-return` — Unsafe return of a value of type `Promise<any>`.

### `src/pages/Auth.tsx` — 15 warning(s)

- [ ] L60:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L62:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L62:26 `no-unsafe-member-access` — Unsafe member access .userId on an `any` value.
- [ ] L63:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L63:29 `no-unsafe-member-access` — Unsafe member access .email on an `any` value.
- [ ] L64:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L64:22 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L64:35 `no-unsafe-member-access` — Unsafe member access .email on an `any` value.
- [ ] L64:52 `no-unsafe-member-access` — Unsafe member access [0] on an `any` value.
- [ ] L65:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L65:28 `no-unsafe-member-access` — Unsafe member access .role on an `any` value.
- [ ] L66:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L66:32 `no-unsafe-member-access` — Unsafe member access .tenantId on an `any` value.
- [ ] L82:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L83:21 `no-unsafe-member-access` — Unsafe member access .onboardingCompleted on an `any` value.

### `src/lib/impact/simulation.ts` — 14 warning(s)

- [ ] L135:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L140:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L160:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L165:45 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L165:52 `no-unsafe-member-access` — Unsafe member access .totals on an `any` value.
- [ ] L166:43 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L166:50 `no-unsafe-member-access` — Unsafe member access .totals on an `any` value.
- [ ] L167:41 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L167:48 `no-unsafe-member-access` — Unsafe member access .totals on an `any` value.
- [ ] L168:36 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L168:43 `no-unsafe-member-access` — Unsafe member access .totals on an `any` value.
- [ ] L169:36 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L169:43 `no-unsafe-member-access` — Unsafe member access .totals on an `any` value.
- [ ] L172:3 `no-unsafe-return` — Unsafe return of a value of type `any`.

### `src/pages/Settings.tsx` — 14 warning(s)

- [ ] L31:17 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L96:35 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L96:47 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L104:41 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `{ marketing: boolean; transactional: boolean; notifications: boolean; }`.
- [ ] L126:35 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L126:47 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L134:30 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `{ marketing: boolean; transactional: boolean; notifications: boolean; }`.
- [ ] L134:78 `no-unsafe-member-access` — Unsafe member access [key] on an `any` value.
- [ ] L278:30 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L278:48 `no-unsafe-member-access` — Unsafe member access .transactional on an `any` value.
- [ ] L289:30 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L289:48 `no-unsafe-member-access` — Unsafe member access .marketing on an `any` value.
- [ ] L300:30 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L300:48 `no-unsafe-member-access` — Unsafe member access .notifications on an `any` value.

### `src/lib/analytics.ts` — 13 warning(s)

- [ ] L33:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L34:7 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L34:14 `no-unsafe-member-access` — Unsafe member access .push on an `any` value.
- [ ] L37:18 `no-unsafe-member-access` — Unsafe member access .length on an `any` value.
- [ ] L38:9 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L38:16 `no-unsafe-member-access` — Unsafe member access .splice on an `any` value.
- [ ] L38:33 `no-unsafe-member-access` — Unsafe member access .length on an `any` value.
- [ ] L93:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L107:49 `no-unsafe-member-access` — Unsafe member access .event on an `any` value.
- [ ] L108:46 `no-unsafe-member-access` — Unsafe member access .event on an `any` value.
- [ ] L109:51 `no-unsafe-member-access` — Unsafe member access .event on an `any` value.
- [ ] L110:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L110:50 `no-unsafe-member-access` — Unsafe member access .timestamp on an `any` value.

### `src/lib/governance/MultiSpeciesGovernance.ts` — 13 warning(s)

- [ ] L92:36 `no-unsafe-argument` — Unsafe argument of type `Map<any, any>` assigned to a parameter of type `Map<string, any>`.
- [ ] L97:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L102:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L102:22 `no-unsafe-member-access` — Unsafe member access .votingWeight on an `any` value.
- [ ] L113:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L113:18 `no-unsafe-member-access` — Unsafe member access .votingWeight on an `any` value.
- [ ] L140:32 `no-unsafe-member-access` — Unsafe member access .dataStreams on an `any` value.
- [ ] L140:139 `no-unsafe-member-access` — Unsafe member access .represents on an `any` value.
- [ ] L150:27 `no-unsafe-member-access` — Unsafe member access .weight on an `any` value.
- [ ] L151:16 `no-unsafe-member-access` — Unsafe member access .vote on an `any` value.
- [ ] L152:32 `no-unsafe-member-access` — Unsafe member access .weight on an `any` value.
- [ ] L153:23 `no-unsafe-member-access` — Unsafe member access .vote on an `any` value.
- [ ] L154:35 `no-unsafe-member-access` — Unsafe member access .weight on an `any` value.

### `src/pages/Prototype.tsx` — 11 warning(s)

- [ ] L34:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L49:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L50:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L50:25 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L52:3 `no-unsafe-return` — Unsafe return of a value of type `Promise<any>`.
- [ ] L127:28 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string>`.
- [ ] L127:30 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L205:16 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string>`.
- [ ] L205:18 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L313:16 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string>`.
- [ ] L313:18 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/components/PlanetaryMeasurementDashboard.tsx` — 10 warning(s)

- [ ] L97:3 `no-unsafe-return` — Unsafe return of a value of type `Promise<any>`.
- [ ] L104:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L105:3 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L105:15 `no-unsafe-member-access` — Unsafe member access .alerts on an `any` value.
- [ ] L124:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L126:41 `no-unsafe-member-access` — Unsafe member access .report on an `any` value.
- [ ] L263:41 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"biodiversity" \| "overview" \| "carbon" \| "soil" \| "alerts">`.
- [ ] L355:33 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L355:39 `no-unsafe-member-access` — Unsafe member access .id on an `any` value.
- [ ] L355:50 `no-unsafe-assignment` — Unsafe assignment of an `any` value.

### `src/lib/api/atlasClient.ts` — 10 warning(s)

- [ ] L21:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L22:13 `no-unsafe-member-access` — Unsafe member access .__ATLAS_API_URL__ on an `any` value.
- [ ] L22:32 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L22:43 `no-unsafe-member-access` — Unsafe member access .__ATLAS_API_URL__ on an `any` value.
- [ ] L24:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L31:3 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L73:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L74:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L74:25 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L76:3 `no-unsafe-return` — Unsafe return of a value of type `Promise<any>`.

### `src/services/notificationService.ts` — 10 warning(s)

- [ ] L23:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L29:67 `no-unsafe-member-access` — Computed name [key] resolves to an `any` value.
- [ ] L275:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L276:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L391:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L432:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L434:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L509:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L511:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L611:7 `no-unsafe-return` — Unsafe return of a value of type `any`.

### `src/components/InteractiveChartsDashboard.tsx` — 9 warning(s)

- [ ] L132:8 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L132:16 `no-unsafe-member-access` — Unsafe member access .map on an `any` value.
- [ ] L136:22 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L136:45 `no-unsafe-member-access` — Unsafe member access .color on an `any` value.
- [ ] L138:58 `no-unsafe-member-access` — Unsafe member access .name on an `any` value.
- [ ] L140:27 `no-unsafe-member-access` — Unsafe member access .value on an `any` value.
- [ ] L141:17 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L141:23 `no-unsafe-member-access` — Unsafe member access .value on an `any` value.
- [ ] L142:23 `no-unsafe-member-access` — Unsafe member access .value on an `any` value.

### `src/pages/Checkout.tsx` — 9 warning(s)

- [ ] L278:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L284:15 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L284:28 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L286:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L299:40 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L299:52 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L301:17 `no-unsafe-member-access` — Unsafe member access .redirectUrl on an `any` value.
- [ ] L302:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L302:37 `no-unsafe-member-access` — Unsafe member access .redirectUrl on an `any` value.

### `src/pages/enterprise/APIAnalyticsDashboard.tsx` — 9 warning(s)

- [ ] L70:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L71:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L72:20 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<APIMetrics \| null>`.
- [ ] L72:25 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L93:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L94:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L95:23 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<TimeSeriesData[]>`.
- [ ] L95:28 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L185:81 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"month" \| "week" \| "day" \| "hour">`.

### `src/pages/enterprise/MFASetup.tsx` — 9 warning(s)

- [ ] L48:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L49:17 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<MFAStatus \| null>`.
- [ ] L67:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L68:17 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<MFASecret \| null>`.
- [ ] L94:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L96:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L143:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L144:43 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L144:61 `no-unsafe-member-access` — Unsafe member access .backupCodes on an `any` value.

### `src/components/pricing/CheckoutModal.tsx` — 8 warning(s)

- [ ] L184:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L185:16 `no-unsafe-member-access` — Unsafe member access .valid on an `any` value.
- [ ] L185:41 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L185:52 `no-unsafe-member-access` — Unsafe member access .promoCode on an `any` value.
- [ ] L185:68 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L185:89 `no-unsafe-member-access` — Unsafe member access .discountAmount on an `any` value.
- [ ] L186:26 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string>`.
- [ ] L186:31 `no-unsafe-member-access` — Unsafe member access .errorMessage on an `any` value.

### `src/hooks/usePayment.ts` — 8 warning(s)

- [ ] L91:15 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L91:28 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L101:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L101:37 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L147:15 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L147:28 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L152:25 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.
- [ ] L152:37 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/hooks/useTransactions.ts` — 8 warning(s)

- [ ] L75:7 `no-unsafe-return` — Unsafe return of a value of type `any[]`.
- [ ] L75:44 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L77:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L77:20 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.
- [ ] L116:7 `no-unsafe-return` — Unsafe return of a value of type `any[]`.
- [ ] L116:44 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L118:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L118:20 `no-unsafe-member-access` — Unsafe member access .carbon_projects on an `any` value.

### `src/lib/api/__tests__/atlasClient.test.ts` — 8 warning(s)

- [ ] L79:11 `no-unsafe-assignment` — Unsafe array destructuring of an `any` array value.
- [ ] L80:18 `no-unsafe-member-access` — Unsafe member access .headers on an `any` value.
- [ ] L92:11 `no-unsafe-assignment` — Unsafe array destructuring of an `any` array value.
- [ ] L93:18 `no-unsafe-member-access` — Unsafe member access .headers on an `any` value.
- [ ] L105:11 `no-unsafe-assignment` — Unsafe array destructuring of an `any` array value.
- [ ] L106:20 `no-unsafe-member-access` — Unsafe member access .headers on an `any` value.
- [ ] L148:11 `no-unsafe-assignment` — Unsafe array destructuring of an `any` array value.
- [ ] L161:11 `no-unsafe-assignment` — Unsafe array destructuring of an `any` array value.

### `src/components/analytics/ReportBuilder.tsx` — 7 warning(s)

- [ ] L415:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L416:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L417:43 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.
- [ ] L439:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L440:16 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L441:21 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| URL \| undefined`.
- [ ] L441:26 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.

### `src/components/marketplace/ProjectComparisonModal.tsx` — 7 warning(s)

- [ ] L59:46 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L59:57 `no-unsafe-member-access` — Unsafe member access [key] on an `any` value.
- [ ] L64:23 `no-unsafe-argument` — Unsafe spread of an `any[]` array type.
- [ ] L66:21 `no-unsafe-argument` — Unsafe spread of an `any[]` array type.
- [ ] L225:37 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L225:62 `no-unsafe-member-access` — Unsafe member access [metric.key] on an `any` value.
- [ ] L227:37 `no-unsafe-assignment` — Unsafe assignment of an `any` value.

### `src/lib/api/client.ts` — 7 warning(s)

- [ ] L4:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L67:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L68:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L68:38 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L68:59 `no-unsafe-member-access` — Unsafe member access .error on an `any` value.
- [ ] L92:11 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L95:9 `no-unsafe-return` — Unsafe return of a value of type `Promise<any>`.

### `src/components/admin/adminFigma/components/ui/chart.tsx` — 6 warning(s)

- [ ] L185:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L185:56 `no-unsafe-member-access` — Unsafe member access .fill on an `any` value.
- [ ] L196:63 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `Payload<ValueType, NameType>[]`.
- [ ] L216:29 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L217:29 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L284:18 `no-unsafe-assignment` — Unsafe assignment of an `any` value.

### `src/components/ui/chart.tsx` — 6 warning(s)

- [ ] L166:19 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L166:58 `no-unsafe-member-access` — Unsafe member access .fill on an `any` value.
- [ ] L177:65 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `Payload<ValueType, NameType>[]`.
- [ ] L193:31 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L194:31 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L255:18 `no-unsafe-assignment` — Unsafe assignment of an `any` value.

### `src/lib/api/sentinel-hub.ts` — 6 warning(s)

- [ ] L45:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L46:5 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L101:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L228:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L229:7 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L229:19 `no-unsafe-member-access` — Unsafe member access .access_token on an `any` value.

### `src/pages/admin/FeatureFlags.tsx` — 6 warning(s)

- [ ] L28:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L29:16 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<Flags>`.
- [ ] L31:16 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string \| null>`.
- [ ] L31:20 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L60:16 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string \| null>`.
- [ ] L60:20 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/components/PortfolioAnalyticsDashboard.tsx` — 5 warning(s)

- [ ] L61:13 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L156:66 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L169:67 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L272:66 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.
- [ ] L282:67 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| Date`.

### `src/components/portfolio/ExportMenu.tsx` — 5 warning(s)

- [ ] L41:31 `no-unsafe-argument` — Unsafe argument of type `any[]` assigned to a parameter of type `Holding[]`.
- [ ] L45:35 `no-unsafe-argument` — Unsafe argument of type `any[]` assigned to a parameter of type `Transaction[]`.
- [ ] L49:31 `no-unsafe-argument` — Unsafe argument of type `any[]` assigned to a parameter of type `Holding[]`.
- [ ] L49:41 `no-unsafe-argument` — Unsafe argument of type `any[]` assigned to a parameter of type `Transaction[]`.
- [ ] L53:35 `no-unsafe-argument` — Unsafe argument of type `any[]` assigned to a parameter of type `Holding[]`.

### `src/components/skeletons/MarketplaceSkeleton.tsx` — 5 warning(s)

- [ ] L61:19 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L67:19 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L82:13 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L111:13 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L147:15 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/lib/ConsciousnessInterface.ts` — 5 warning(s)

- [ ] L28:11 `no-unsafe-assignment` — Unsafe assignment of an error typed value.
- [ ] L60:5 `no-unsafe-return` — Unsafe return of a value of type error.
- [ ] L64:31 `no-unsafe-member-access` — Unsafe member access .coherence on an `any` value.
- [ ] L64:53 `no-unsafe-member-access` — Unsafe member access .harmony on an `any` value.
- [ ] L78:46 `no-unsafe-member-access` — Unsafe member access .level on an `any` value.

### `src/pages/ImpactDashboard.tsx` — 5 warning(s)

- [ ] L255:28 `no-unsafe-assignment` — Unsafe assignment of an error typed value.
- [ ] L263:77 `no-unsafe-call` — Unsafe call of a type that could not be resolved.
- [ ] L263:94 `no-unsafe-member-access` — Unsafe member access .replace on a type that cannot be resolved.
- [ ] L269:87 `no-unsafe-call` — Unsafe call of a type that could not be resolved.
- [ ] L269:105 `no-unsafe-member-access` — Unsafe member access .toLocaleString on a type that cannot be resolved.

### `src/services/exportService.ts` — 5 warning(s)

- [ ] L125:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L127:25 `no-unsafe-member-access` — Unsafe member access .success on an `any` value.
- [ ] L133:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L133:15 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L133:28 `no-unsafe-member-access` — Unsafe member access .data on an `any` value.

### `src/components/CivilizationalArchitectureDashboard.tsx` — 4 warning(s)

- [ ] L226:69 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L226:97 `no-unsafe-member-access` — Unsafe member access .toFixed on an `any` value.
- [ ] L234:68 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L234:101 `no-unsafe-member-access` — Unsafe member access .toFixed on an `any` value.

### `src/components/portfolio/RetirementModal.tsx` — 4 warning(s)

- [ ] L63:47 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L71:15 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L71:21 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L82:60 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/components/skeletons/DashboardSkeleton.tsx` — 4 warning(s)

- [ ] L78:13 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L105:13 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L125:13 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L159:19 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/hooks/useRealtimePriceAlerts.ts` — 4 warning(s)

- [ ] L89:14 `no-unsafe-enum-comparison` — The two values in this comparison do not have a shared enum type.
- [ ] L91:21 `no-unsafe-enum-comparison` — The two values in this comparison do not have a shared enum type.
- [ ] L91:51 `no-unsafe-enum-comparison` — The two values in this comparison do not have a shared enum type.
- [ ] L94:21 `no-unsafe-enum-comparison` — The two values in this comparison do not have a shared enum type.

### `src/integrations/supabase/client.ts` — 4 warning(s)

- [ ] L5:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L6:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L15:48 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L15:68 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.

### `src/lib/api/socket.ts` — 4 warning(s)

- [ ] L4:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L4:20 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L4:50 `no-unsafe-member-access` — Unsafe member access .replace on an `any` value.
- [ ] L76:24 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| undefined`.

### `src/lib/errorReporting.ts` — 4 warning(s)

- [ ] L32:27 `no-unsafe-member-access` — Unsafe member access .stack on an `any` value.
- [ ] L40:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L43:62 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.
- [ ] L44:22 `no-unsafe-member-access` — Unsafe member access .stack on an `any` value.

### `src/components/ApiStatus.tsx` — 3 warning(s)

- [ ] L17:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L19:43 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L19:72 `no-unsafe-member-access` — Unsafe member access .replace on an `any` value.

### `src/hooks/useRealtimeSync.ts` — 3 warning(s)

- [ ] L50:17 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L50:37 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string`.
- [ ] L51:28 `no-unsafe-return` — Unsafe return of a value of type `any`.

### `src/pages/AdministratorDashboard.tsx` — 3 warning(s)

- [ ] L265:15 `no-unsafe-assignment` — Unsafe assignment of an error typed value.
- [ ] L267:29 `no-unsafe-assignment` — Unsafe assignment of an error typed value.
- [ ] L267:36 `no-unsafe-member-access` — Unsafe member access .color on a type that cannot be resolved.

### `src/pages/EnterpriseDashboard.tsx` — 3 warning(s)

- [ ] L161:15 `no-unsafe-assignment` — Unsafe assignment of an error typed value.
- [ ] L163:58 `no-unsafe-member-access` — Unsafe member access .color on a type that cannot be resolved.
- [ ] L164:21 `no-unsafe-member-access` — Unsafe member access .icon on a type that cannot be resolved.

### `src/pages/Payment.tsx` — 3 warning(s)

- [ ] L75:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L90:16 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string \| null>`.
- [ ] L90:22 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/pages/Portfolio.tsx` — 3 warning(s)

- [ ] L60:15 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L163:25 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L276:25 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/components/Footer.tsx` — 2 warning(s)

- [ ] L28:15 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L28:21 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.

### `src/components/MeasurementDashboard.tsx` — 2 warning(s)

- [ ] L264:61 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L264:67 `no-unsafe-member-access` — Unsafe member access .toFixed on an `any` value.

### `src/components/Navigation.tsx` — 2 warning(s)

- [ ] L17:9 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L17:49 `no-unsafe-member-access` — Unsafe member access .onboardingCompleted on an `any` value.

### `src/components/NewsletterBanner.tsx` — 2 warning(s)

- [ ] L147:15 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L147:21 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.

### `src/components/RealtimeToast.tsx` — 2 warning(s)

- [ ] L94:74 `no-unsafe-call` — Unsafe call of an `any` typed value.
- [ ] L94:99 `no-unsafe-member-access` — Unsafe member access .toLocaleString on an `any` value.

### `src/components/achievements/AchievementNotification.tsx` — 2 warning(s)

- [ ] L50:7 `no-unsafe-call` — Unsafe call of a type that could not be resolved.
- [ ] L56:7 `no-unsafe-call` — Unsafe call of a type that could not be resolved.

### `src/components/admin/ProjectFormModal.tsx` — 2 warning(s)

- [ ] L165:19 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| boolean \| ReactElement<any, string \| JSXElementConstructor<any>> \| Iterable<ReactNode> \| ReactPortal \| (() => ReactNode) \| null \| undefined`.
- [ ] L165:25 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/components/admin/SecurityMonitoringDashboard.tsx` — 2 warning(s)

- [ ] L107:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L108:18 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<SecurityMetrics \| null>`.

### `src/components/admin/adminFigma/components/ActivityLog.tsx` — 2 warning(s)

- [ ] L236:52 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"user" \| "data" \| "security" \| "all" \| "ai" \| "system" \| "finance">`.
- [ ] L251:50 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"all" \| "critical" \| "warning" \| "info">`.

### `src/components/admin/adminFigma/components/ImpactLeaderboards.tsx` — 2 warning(s)

- [ ] L95:43 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"month" \| "week" \| "alltime">`.
- [ ] L110:42 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"biodiversity" \| "community" \| "all" \| "carbon">`.

### `src/components/admin/adminFigma/components/UserManagement.tsx` — 2 warning(s)

- [ ] L177:46 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"admin" \| "operator" \| "all" \| "analyst" \| "viewer">`.
- [ ] L189:48 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"active" \| "suspended" \| "inactive" \| "all">`.

### `src/components/health/HealthMonitoring.tsx` — 2 warning(s)

- [ ] L986:31 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.
- [ ] L999:31 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/components/marketplace/PurchaseModal.tsx` — 2 warning(s)

- [ ] L64:19 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| boolean \| ReactElement<any, string \| JSXElementConstructor<any>> \| Iterable<ReactNode> \| ReactPortal \| (() => ReactNode) \| null \| undefined`.
- [ ] L64:25 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/components/profile/EmailVerificationStatus.tsx` — 2 warning(s)

- [ ] L42:19 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `string \| number \| boolean \| ReactElement<any, string \| JSXElementConstructor<any>> \| Iterable<ReactNode> \| ReactPortal \| (() => ReactNode) \| null \| undefined`.
- [ ] L42:25 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/hooks/useAchievements.ts` — 2 warning(s)

- [ ] L185:25 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L185:53 `no-unsafe-member-access` — Unsafe member access .project_type on an `any` value.

### `src/hooks/useValidation.ts` — 2 warning(s)

- [ ] L33:15 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L35:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.

### `src/lib/impact/fitnessTracker.ts` — 2 warning(s)

- [ ] L170:7 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L170:12 `no-unsafe-member-access` — Unsafe member access [key] on an `any` value.

### `src/lib/security.ts` — 2 warning(s)

- [ ] L65:13 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L68:22 `no-unsafe-member-access` — Unsafe member access .exp on an `any` value.

### `src/pages/DashboardOverview.tsx` — 2 warning(s)

- [ ] L291:13 `no-unsafe-return` — Unsafe return of a value of type `any`.
- [ ] L297:15 `no-unsafe-assignment` — Unsafe array destructuring of an `any` array value.

### `src/pages/Profile.tsx` — 2 warning(s)

- [ ] L157:35 `no-unsafe-assignment` — Unsafe assignment of an `any` value.
- [ ] L157:47 `no-unsafe-member-access` — Unsafe member access .message on an `any` value.

### `src/pages/Transactions.tsx` — 2 warning(s)

- [ ] L53:15 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.
- [ ] L53:21 `no-unsafe-assignment` — Unsafe object destructuring of a property with an `any` value.

### `src/components/CreditValuationEngine.tsx` — 1 warning(s)

- [ ] L220:101 `no-unsafe-return` — Unsafe return of a value of type `any`.

### `src/components/HeroSection.tsx` — 1 warning(s)

- [ ] L104:9 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/components/PageHero.tsx` — 1 warning(s)

- [ ] L124:9 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/components/RoleSpecificDashboards.tsx` — 1 warning(s)

- [ ] L197:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.

### `src/components/TechnologyStack.tsx` — 1 warning(s)

- [ ] L141:21 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/components/admin/ProjectsTable.tsx` — 1 warning(s)

- [ ] L111:13 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/components/admin/SalesOverview.tsx` — 1 warning(s)

- [ ] L42:11 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/components/admin/TransactionsTable.tsx` — 1 warning(s)

- [ ] L73:13 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/components/admin/adminFigma/components/ARImpactOverlay.tsx` — 1 warning(s)

- [ ] L48:21 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/components/admin/adminFigma/components/CollaborativeCanvas.tsx` — 1 warning(s)

- [ ] L195:40 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"select" \| "text" \| "circle" \| "rect" \| "sticky">`.

### `src/components/admin/adminFigma/components/PredictiveImpact.tsx` — 1 warning(s)

- [ ] L280:45 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"30d" \| "60d" \| "90d">`.

### `src/components/admin/adminFigma/components/ReFiConsole.tsx` — 1 warning(s)

- [ ] L235:28 `no-unsafe-member-access` — Unsafe member access .payload on an `any` value.

### `src/components/enterprise/EnterpriseDashboard.tsx` — 1 warning(s)

- [ ] L258:47 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"security" \| "overview" \| "compliance" \| "integrations">`.

### `src/components/marketplace/ReFiConsole.tsx` — 1 warning(s)

- [ ] L230:30 `no-unsafe-member-access` — Unsafe member access .payload on an `any` value.

### `src/components/marketplace/RegenerativeMetricsCard.tsx` — 1 warning(s)

- [ ] L37:15 `no-unsafe-assignment` — Unsafe spread of an `any` value in an array.

### `src/context/OnboardingContext.tsx` — 1 warning(s)

- [ ] L45:30 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<OnboardingState>`.

### `src/hooks/useSubscription.ts` — 1 warning(s)

- [ ] L155:11 `no-unsafe-assignment` — Unsafe assignment of an `any` value.

### `src/lib/InterplanetaryNetwork.ts` — 1 warning(s)

- [ ] L57:29 `no-unsafe-member-access` — Unsafe member access .regenerationCapacity on an `any` value.

### `src/pages/CarbonCalculator.tsx` — 1 warning(s)

- [ ] L110:60 `no-unsafe-argument` — Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"personal" \| "business">`.
