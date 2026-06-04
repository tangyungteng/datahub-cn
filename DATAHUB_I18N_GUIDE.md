# DataHub 1.5.0.6 前端汉化（i18n 国际化）操作文档

> 本文档记录 DataHub 1.5.0.6 前端的中文国际化（i18n）完整执行方案，供后续开发者（人类或 AI）理解架构、新增翻译、维护版本升级以及构建部署。

---

## 1. 项目概述

### 1.1 前端技术栈

| 项目 | 版本/说明 |
| --- | --- |
| 框架 | React 17 |
| 语言 | TypeScript 4.8.4 |
| 构建工具 | Vite 6 |
| UI 组件库 | Ant Design 4.24.7 |
| 包管理器 | Yarn |
| GraphQL | Apollo Client + GraphQL Codegen |

### 1.2 前端代码位置

- 前端工程根目录：`datahub-web-react/`
- 源码目录：`datahub-web-react/src/`
- i18n 基础设施：`datahub-web-react/src/i18n/`

### 1.3 项目特点：多代组件并存

DataHub 在长期演进中保留了多代 UI 组件，**同一功能可能存在 V1/V2/V3 三套实现**，运行时由 Feature Flag 或路由决定加载哪一代。汉化前必须先确定目标页面实际使用的是哪一代组件，否则会改了不生效。

常见多代组件目录：

| 功能 | 当前主用版本目录 |
| --- | --- |
| 首页 | `app/homeV2/`、`app/homeV3/` |
| 搜索 | `app/searchV2/` |
| 设置 | `app/settingsV2/` |
| 数据源/采集 | `app/ingestV2/` |
| 数据字典 | `app/glossaryV2/` |
| 实体详情 | `app/entityV2/` |
| 血缘 | `app/lineageV2/` |

> **重要原则**：优先修改"V 版本最高"且当前路由实际加载的组件。修改前用浏览器实际访问页面 + 全局搜索文案定位真实渲染组件。

---

## 2. i18n 技术方案设计

### 2.1 选用的库及版本

| 库 | 版本 | 说明 |
| --- | --- | --- |
| `react-i18next` | v13.5.0 | React 绑定，提供 `useTranslation` Hook |
| `i18next` | v23.16.8 | 核心引擎 |
| `i18next-browser-languagedetector` | v7.2.2 | 浏览器语言自动检测 + localStorage 持久化 |

### 2.2 为什么锁定这些版本

> ⚠️ **关键约束**：项目使用 TypeScript 4.8.4。`i18next` 最新版（v24+/v26）依赖 TS 5+ 的语法特性，会导致类型编译失败。

因此必须锁定到兼容 TS 4.8 的版本：`i18next@23.x` + `react-i18next@13.x` + `i18next-browser-languagedetector@7.x`，三者 API 与最新版基本一致，功能不受影响。**升级依赖时切勿盲目升到最新版。**

### 2.3 配置文件位置

`datahub-web-react/src/i18n/index.ts`

### 2.4 关键配置项

```typescript
i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',      // 找不到时回退英文
        defaultNS: 'common',    // 默认命名空间
        lng: 'zh',              // 默认中文
        keySeparator: '.',      // 用 . 解析嵌套 key（如 home.good_evening）
        interpolation: {
            escapeValue: false, // React 已自带 XSS 转义
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'datahub-language', // localStorage 持久化键名
        },
    });
```

> ⚠️ **必须显式设置 `keySeparator: '.'`**：i18next v23+ 起 `keySeparator` 默认值由 `'.'` 变为 `false`。若不显式设置，`t('home.good_evening')` 这类嵌套 key 将无法匹配语言包中 `{"home":{"good_evening":"..."}}` 的结构，导致 key 原样显示。

### 2.5 localStorage 持久化

- 键名：`datahub-language`
- 取值：`zh` 或 `en`
- 由 `LanguageDetector` 的 `caches: ['localStorage']` 自动写入。

### 2.6 Ant Design ConfigProvider locale 同步

Ant Design 自身有大量内置文案（DatePicker、Table 分页、空状态等）。需在 `CustomThemeProvider.tsx` 中根据 `i18n.language` 切换 `ConfigProvider` 的 `locale`（`zhCN` / `enUS`），保证组件库文案与界面语言一致。

### 2.7 dayjs locale 同步

`src/i18n/index.ts` 内监听 `languageChanged` 事件，同步切换 dayjs 的 locale：

```typescript
function syncDayjsLocale(lng: string) {
    dayjs.locale(lng === 'zh' ? 'zh' : 'en');
}
syncDayjsLocale(i18n.language || 'zh');
i18n.on('languageChanged', syncDayjsLocale);
```

---

## 3. 语言包结构

### 3.1 文件位置

```
datahub-web-react/src/i18n/locales/
├── en/
│   ├── common.json     # 通用文案（最大）
│   ├── auth.json       # 认证/登录
│   ├── search.json     # 搜索
│   ├── entity.json     # 实体
│   ├── settings.json   # 设置
│   └── messages.json   # 消息/提示
└── zh/
    ├── common.json
    ├── auth.json
    ├── search.json
    ├── entity.json
    ├── settings.json
    └── messages.json
```

> en 与 zh 目录下文件名、key 结构必须**完全一一对应**。

### 3.2 命名空间（Namespace）

| 命名空间 | 文件 | 用途 |
| --- | --- | --- |
| `common` | common.json | 默认命名空间，通用文案、导航、按钮、首页等 |
| `auth` | auth.json | 登录、认证相关 |
| `search` | search.json | 搜索结果、筛选 |
| `entity` | entity.json | 实体类型、实体详情通用 |
| `settings` | settings.json | 设置页面 |
| `messages` | messages.json | 全局提示、空状态消息 |

### 3.3 Key 命名规范

- 三级结构：`模块.功能.描述`，全部小写 + 下划线
- 按钮类文案以**动词**开头，标签类以**名词**开头
- 插值使用 `{{var}}` 语法

示例：

```json
{
  "home": {
    "good_evening": "晚上好",
    "good_morning": "早上好"
  },
  "nav": {
    "documentation": "文档",
    "settings": "设置"
  },
  "button": {
    "create_domain": "创建数据域",
    "save": "保存"
  },
  "message": {
    "welcome_back": "欢迎回来，{{name}}"
  }
}
```

调用：

```tsx
t('home.good_evening');                 // 晚上好
t('message.welcome_back', { name });    // 欢迎回来，张三
```

---

## 4. 组件改造模式

根据组件类型，存在 5 种翻译模式。**核心难点在于：`useTranslation` 是 React Hook，只能在组件/自定义 Hook 中使用，不能在模块级常量或普通 `.ts` 工具函数中使用。**

### 4.1 普通 React 组件（最常见）

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
    const { t } = useTranslation('common'); // 指定命名空间，默认 common 可省略
    return <Button>{t('button.save')}</Button>;
};
```

### 4.2 模块级常量（不能用 Hook）—— "使用时翻译"模式

常量在模块加载时即被求值，此时 i18n 可能尚未初始化，**绝不能在常量定义处直接调用 `t()`**，否则报错或拿到未翻译文案。

**方案**：常量只存储 **i18n key**，在渲染组件中再调用 `t()`。

```typescript
// 常量定义（constants.ts）—— 只存 key
export const EMPTY_MESSAGES = {
    domains: { title: 'empty.domains.title', description: 'empty.domains.description' },
};
```

```tsx
// 渲染组件中翻译
const { t } = useTranslation();
<Empty description={t(EMPTY_MESSAGES.domains.title)} />
```

典型应用：`EMPTY_MESSAGES`、实体 Tab 名称常量等。

### 4.3 统一渲染层翻译映射

当**多个实体共用同一渲染入口**、且原始值来自配置/英文常量时，在渲染层做"英文 → 中文"的映射。

典型文件：

- `app/entityV2/shared/tabs/translateEntityTabName.ts` —— 实体 Tab 名英→中映射
- `translateFilterLabel` / `useFilterDisplayName` —— 搜索筛选标签翻译

```typescript
// translateEntityTabName.ts（示意）
export function translateEntityTabName(name: string, t: TFunction): string {
    const map: Record<string, string> = {
        Schema: t('entity.tab.schema'),
        Documentation: t('entity.tab.documentation'),
        Properties: t('entity.tab.properties'),
        Lineage: t('entity.tab.lineage'),
    };
    return map[name] ?? name; // 未命中保持原值
}
```

### 4.4 工具函数中的翻译（`.ts` 文件，不能用 Hook）

**方案 A：接收可选的 `t` 参数**

```typescript
export function getExecutionRequestStatusDisplayText(status: string, t?: TFunction): string {
    if (!t) return status; // 未传 t 时回退英文
    return t(`ingest.status.${status}`);
}
```

调用方（组件内）传入 `t`：

```tsx
const { t } = useTranslation();
getExecutionRequestStatusDisplayText(status, t);
```

**方案 B：返回 i18n key，在使用处翻译**

```typescript
// ownershipUtils.ts —— 返回 key
export function getOwnershipTypeKey(type: string): string {
    return `ownership.type.${type}`;
}
```

```tsx
// 使用处翻译
t(getOwnershipTypeKey(type));
```

### 4.5 路由相关的翻译（最易踩坑）

当 Tab 的 `name` 字段同时用于 **URL 路由**时，**绝对不能修改 `name` 的值**，否则路由匹配失败、页面 404 或 Tab 无法切换。

**正确做法**：`name`（路由 key）保持英文，只在**显示层**翻译。

```tsx
// EntityTabs.tsx（示意）
<Tab
    key={tab.name}                              // 路由 key，保持英文，不可改
    name={translateEntityTabName(tab.name, t)}  // 仅显示文本翻译
/>
```

---

## 5. 已汉化的页面和组件清单

按模块分组列出主要改造点。新版本若新增同类组件，参照对应模式补充。

| 模块 | 说明 | 主要目录/文件 |
| --- | --- | --- |
| **基础设施** | i18n 初始化、语言包、locale 同步 | `src/i18n/index.ts`、`src/i18n/locales/`、`CustomThemeProvider.tsx` |
| **侧边栏导航** | 导航菜单项、语言切换入口 | `app/homeV2/layout/NavSidebar.tsx` 等 |
| **首页** | 问候语、卡片、模块标题 | `app/homeV3/` |
| **登录页** | 登录表单、按钮、提示 | `app/auth/`、`loginV2`（auth.json） |
| **数据字典** | 术语、术语组、操作按钮 | `app/glossaryV2/` |
| **标签管理** | 标签列表、创建/编辑 | 标签相关组件 |
| **数据源管理** | 采集源、执行状态、调度 | `app/ingestV2/` |
| **数据分析** | 分析页面文案 | analytics 相关 |
| **设置页面** | 各设置项、菜单 | `app/settingsV2/`（settings.json） |
| **搜索组件** | 搜索框、筛选、结果、排序 | `app/searchV2/`（search.json） |
| **数据域** | 域列表、创建、空状态 | domain 相关 |
| **结构化属性** | 属性名、类型、操作 | structured properties 相关 |
| **实体详情页 Tab 系统** | Tab 名显示翻译 | `app/entityV2/shared/tabs/translateEntityTabName.ts`、`EntityTabs.tsx` |
| **实体表头** | Schema / Properties 表头 | entityV2 schema/properties 组件 |
| **血缘** | 血缘视图操作文案（部分） | `app/lineageV2/` |
| **统计** | Stats 标签、指标名（前端静态部分） | stats 相关 |
| **质量** | Quality/Assertion 文案 | quality 相关 |
| **侧边栏空状态** | Empty 提示文案 | `EMPTY_MESSAGES` 常量 + 渲染组件 |

> 完整改动以 Git 提交记录为准；定位某文案对应文件可全局搜索其中文/英文原文。

---

## 6. 未汉化 / 不可汉化的内容

以下内容**来自后端或为专有名词，前端不做翻译**（与"汉化范围与边界规范"一致）：

| 类别 | 说明 | 原因 |
| --- | --- | --- |
| 实体类型名 | Table、Dataset、Dashboard 等 | 后端返回，跨系统标识 |
| 字段标签 | `entityRegistry.getDisplayName()` 返回值 | 后端/注册表驱动 |
| 数据源名称 | Apache Doris、Airflow 等 | 专有名词，行业通用 |
| 连接器描述 | `sources.json` 中的 `description` | 配置驱动，由数据决定 |
| 图表标题（部分） | 来自后端 GraphQL `highlights`/`charts` | 后端返回 |
| lineageV2 部分操作文案 | 图组件内部分文案 | 组件耦合深，暂不处理 |

> 原则：除专有英文名称外，**前端静态文案全部汉化**；后端返回或配置驱动的文案暂不处理。

---

## 7. 语言切换功能

### 7.1 切换入口

侧边栏底部：`app/homeV2/layout/NavSidebar.tsx`（中/英切换按钮）。

### 7.2 切换逻辑

```tsx
const toggleLanguage = () => {
    const next = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(next);            // 切换语言（触发 languageChanged）
    // localStorage 由 LanguageDetector 的 caches 自动持久化为 datahub-language
};
```

### 7.3 Ant Design locale 同步

`CustomThemeProvider.tsx` 中根据 `i18n.language` 选择 `ConfigProvider` 的 `locale`：

```tsx
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';

const { i18n } = useTranslation();
const antdLocale = i18n.language === 'zh' ? zhCN : enUS;
<ConfigProvider locale={antdLocale}>{children}</ConfigProvider>
```

### 7.4 dayjs locale 同步

见 [2.7](#27-dayjs-locale-同步)，由 `i18n/index.ts` 监听 `languageChanged` 自动切换。

---

## 8. 构建和部署流程

### 8.1 本地构建

```powershell
cd datahub-web-react
yarn build   # GraphQL Codegen + Vite 生产构建，约 4-5 分钟
```

产物输出至 `datahub-web-react/dist/`。

### 8.2 Windows 兼容性修复

在 Windows + PowerShell 环境下构建需注意以下几点：

| 问题 | 修复方式 |
| --- | --- |
| 内联环境变量 | 用 `cross-env` 包裹，并对双引号转义；`package.json` 脚本统一加 `cross-env` |
| GraphQL Codegen 报错 | `codegen.yml` 中注释掉 prettier 相关 hooks |
| 路径别名解析错误 | `vite.config.ts` 路径别名去掉前导斜杠（`path.resolve` 中前导斜杠会导致 Windows 解析错误） |
| 静态资源拷贝失败 | `vite-plugin-static-copy` 的 `src` 字段使用**正斜杠**相对路径 |

> 这些修复属于本地构建环境适配，不影响 Linux/CI 构建。

### 8.3 打包

```powershell
cd datahub-web-react
Compress-Archive -Path dist\* -DestinationPath datahub-react-dist.zip -Force
```

### 8.4 部署（快速验证方式 —— 替换 JAR 内静态资源）

> DataHub 前端资源被打包进 JAR 的 `public/` 路径内。快速验证可直接替换该 JAR，无需重新构建后端。

```bash
# === 服务器端操作 ===
# 1. 解压前端产物
unzip datahub-react-dist.zip -d /tmp/datahub-dist

# 2. 准备新 JAR 目录结构，前端资源放到 public/
mkdir -p /tmp/new-jar/public
cp -r /tmp/datahub-dist/* /tmp/new-jar/public/

# 3. 从原 JAR 提取必要元信息（META-INF、git.properties）
unzip original.jar "META-INF/*" "git.properties" -d /tmp/new-jar/

# 4. 重新打包 JAR
cd /tmp/new-jar && zip -r new-assets.jar .

# 5. 拷贝进容器并重启
docker cp new-assets.jar container:/datahub-frontend/lib/datahub-web-react-datahub-web-react-1.5.0-6-assets.jar
docker restart container
```

> 容器名通常形如 `<项目目录名>-datahub-frontend-react-1`，请用 `docker ps` 确认实际名称。

---

## 9. 新增翻译指南

汉化新页面/组件时的标准操作步骤：

1. **确定 V 版本**：浏览器访问目标页面，全局搜索界面文案，定位**实际渲染**的组件（注意 V1/V2/V3 并存）。
2. **引入 Hook**：组件内 `const { t } = useTranslation('对应命名空间');`
3. **替换硬编码文案**：将字面量替换为 `t('模块.功能.描述')`。
4. **补充语言包**：在 `zh/<ns>.json` 和 `en/<ns>.json` 中**同步**添加相同 key（结构一致）。
5. **常量/工具函数**：不能用 Hook 时，采用 [4.2](#42-模块级常量不能用-hook--使用时翻译模式) / [4.4](#44-工具函数中的翻译ts-文件不能用-hook) 的"使用时翻译"或"返回 key"模式。
6. **路由相关**：只翻译显示文本，**不修改路由 key/name 值**（见 [4.5](#45-路由相关的翻译最易踩坑)）。
7. **验证**：`yarn start` 本地切换中/英，确认无 key 原样显示、无控制台报错。

> Key 命名遵循三级结构 `模块.功能.描述`（小写+下划线），插值用 `{{var}}`。

---

## 10. 版本升级注意事项

升级 DataHub 版本（合并新版前端代码）时：

1. **保留 i18n 基础设施文件**：
   - `src/i18n/index.ts`
   - `src/i18n/locales/`（全部语言包）
   - `app/entityV2/shared/tabs/translateEntityTabName.ts` 及其他 `translate*` 工具
   - `CustomThemeProvider.tsx`、`NavSidebar.tsx` 中的语言切换/locale 同步逻辑
2. **语言包 JSON 合并**：`git merge` 时注意 JSON 冲突，确保 en/zh 结构仍一一对应，无重复/遗漏 key。
3. **补充新组件翻译**：新版本新增/改版的组件（尤其是更高 V 版本）需按 [第 9 节](#9-新增翻译指南) 重新汉化。
4. **依赖版本核对**：
   - 升级 `i18next` 系列前确认与项目 TypeScript 版本兼容（当前锁 v23.x，见 [2.2](#22-为什么锁定这些版本)）。
   - Ant Design 升级时检查 `ConfigProvider` 的 `locale` 导入路径与 `zhCN`/`enUS` 兼容性。
5. **回归验证**：重点检查多代组件页面、路由相关 Tab、日期/分页等 Ant Design 内置文案。

---

## 附：常见问题速查

| 现象 | 原因 | 解决 |
| --- | --- | --- |
| 页面显示 `home.good_evening` 等原始 key | 未设置 `keySeparator: '.'` 或 key 不存在 | 检查 [2.4](#24-关键配置项)，补齐语言包 key |
| 模块加载即报 i18n 未初始化 | 常量定义处直接调用了 `t()` | 改用"使用时翻译"模式（[4.2](#42-模块级常量不能用-hook--使用时翻译模式)） |
| Tab 点击无法切换/页面 404 | 翻译时改了路由 key/name | 路由 key 保持英文，仅翻译显示文本（[4.5](#45-路由相关的翻译最易踩坑)） |
| 类型编译失败（i18next 相关） | i18next 版本过高，需 TS 5+ | 降级到 v23.x（[2.2](#22-为什么锁定这些版本)） |
| DatePicker/分页仍是英文 | 未同步 Ant Design locale | 配置 `ConfigProvider locale`（[7.3](#73-ant-design-locale-同步)） |
| Windows 构建失败 | 环境变量/路径/静态拷贝兼容问题 | 见 [8.2](#82-windows-兼容性修复) |
