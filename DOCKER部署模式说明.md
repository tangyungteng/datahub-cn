# DataHub `docker/` 目录详细解析说明

> 本文档基于 **DataHub 1.5.0.6** 版本，对项目 `docker/` 目录下的所有内容进行系统化梳理，
> 涵盖 Docker Compose 文件、各服务镜像、Dockerfile 构建流程、环境变量、网络端口、存储卷、
> Profile 配置档以及典型部署场景，供运维与开发人员参考。

---

## 1. 目录结构总览

```text
docker/
├── README.md                                  # Docker 镜像/部署/Nuke 任务总说明
├── build.gradle                               # Gradle 构建与 quickstart 任务定义
├── gradle.lockfile
│
├── ── 主 Compose 文件（根目录）──
├── docker-compose.yml                         # 默认全量编排（含 Neo4j）
├── docker-compose-without-neo4j.yml           # 默认编排（不含 Neo4j，用 ES 作图存储）
├── docker-compose-with-cassandra.yml          # 使用 Cassandra 作主存储 + Neo4j
├── docker-compose.override.yml                # 默认 override：追加 MySQL 后端
├── docker-compose-without-neo4j.override.yml  # without-neo4j 的 MySQL override
├── docker-compose-without-neo4j.postgres.override.yml  # PostgreSQL override
├── docker-compose.dev.yml                     # 本地开发（调试镜像 + JVM 远程调试）
├── docker-compose.consumers.yml              # 独立 MAE/MCE 消费者（含 Neo4j）
├── docker-compose.consumers-without-neo4j.yml # 独立消费者（不含 Neo4j）
├── docker-compose.consumers.dev.yml          # 消费者开发调试 override
├── docker-compose.tools.yml                  # 运维调试工具（kafka-ui/kibana 等）
├── docker-compose.kafka-setup.yml            # 占位空文件（兼容旧客户端）
├── docker-compose.m1.yml                     # Apple Silicon(ARM64) 镜像覆盖
│
├── ── 启动脚本 ──
├── quickstart.sh                              # 拉取镜像快速启动（不本地构建）
├── dev.sh                                     # 本地构建并启动开发环境
├── dev-with-cassandra.sh                      # Cassandra 开发环境
├── dev-without-neo4j.sh                       # 无 Neo4j 开发环境
├── nuke.sh                                    # 彻底清理容器/卷/网络
│
├── ── 各服务镜像目录（含 Dockerfile）──
├── datahub-gms/                               # 元数据服务 GMS
├── datahub-frontend/                          # 前端（React）
├── datahub-mae-consumer/                      # MAE 消费者
├── datahub-mce-consumer/                      # MCE 消费者
├── datahub-upgrade/                           # 系统升级/初始化任务
├── datahub-actions/                           # Actions（事件驱动动作）
├── datahub-ingestion/                         # 采集镜像（Python）
├── datahub-ingestion-base/                    # 采集基础镜像
│
├── ── 依赖服务配置目录（仅 env）──
├── mysql/ ├── postgres/ ├── mariadb/          # 关系型数据库
├── elasticsearch/                             # 搜索引擎
├── neo4j/                                     # 图数据库
├── broker/ ├── zookeeper/ ├── schema-registry/ # Kafka 生态
├── cassandra/                                 # Cassandra 主存储（可选）
├── kafka-rest-proxy/ ├── kafka-topics-ui/ ├── kibana/ # 运维工具
│
├── ── 子模块目录 ──
├── profiles/                                  # Profile（配置档）模块化编排
├── quickstart/                                # 快速启动合并版 compose + 生成脚本
├── monitoring/                                # 监控（Prometheus/Grafana/Jaeger）
├── snippets/                                  # Dockerfile 内联片段（采集镜像复用）
├── ingestion/                                 # 示例数据采集脚本
└── airflow/                                   # Airflow 集成示例
```

---

## 2. Docker Compose 文件清单

### 2.1 主编排文件

#### `docker-compose.yml`（默认全量，含 Neo4j）

- **用途**：在单台主机上运行 DataHub 全部容器的默认编排定义。
- **包含服务**：`datahub-frontend-react`、`datahub-actions`、`datahub-gms`、
  `datahub-upgrade`、`kafka-setup`、`elasticsearch`、`neo4j`、`schema-registry`、`broker`、`zookeeper`。
- **图存储**：Neo4j（`GRAPH_SERVICE_IMPL=neo4j`）。
- **特点**：未带数据库服务，需配合 `docker-compose.override.yml`（MySQL）使用。
- **适用场景**：需要图数据库 Neo4j 的标准部署。
- **启动命令**：
  ```bash
  cd docker
  docker compose -p datahub up
  # （默认会自动叠加同目录下的 docker-compose.override.yml）
  ```

#### `docker-compose-without-neo4j.yml`（默认，不含 Neo4j）

- **用途**：与上者类似，但**移除 Neo4j**，使用 Elasticsearch 同时承担搜索与图存储。
- **包含服务**：`datahub-frontend-react`、`datahub-actions`、`datahub-gms`、`datahub-upgrade`、
  `kafka-setup`、`elasticsearch`、`schema-registry`、`broker`、`zookeeper`（无 `neo4j`）。
- **GMS env**：`datahub-gms/env/docker-without-neo4j.env`。
- **适用场景**：推荐的轻量默认部署，减少一个图数据库组件。`quickstart.sh` 在未检测到
  Neo4j 数据卷时默认采用此文件。

#### `docker-compose-with-cassandra.yml`（Cassandra 主存储）

- **用途**：使用 **Cassandra** 作为主元数据存储（替代 MySQL/PostgreSQL），并搭配 Neo4j 图存储。
- **额外服务**：`cassandra`（3.11）、`cassandra-setup`（执行 `init.cql` 初始化 keyspace）。
- **GMS env**：`datahub-gms/env/docker.cassandra.env`。
- **适用场景**：偏好 NoSQL/宽列存储或需要水平扩展元数据存储的场景。

### 2.2 Override 叠加文件

Docker Compose 的 override 文件用于在主文件之上叠加/补充服务定义，需以 `-f` 顺序组合。

| 文件 | 作用 | 关键内容 |
| --- | --- | --- |
| `docker-compose.override.yml` | 默认 override，追加 **MySQL** 后端 | 定义 `mysql:8.2` 服务、`mysqldata` 卷、GMS 令牌/校验相关环境变量 |
| `docker-compose-without-neo4j.override.yml` | without-neo4j 场景的 MySQL override | 追加 MySQL、定义 `datahub-upgrade` 依赖 mysql/es/kafka-setup |
| `docker-compose-without-neo4j.postgres.override.yml` | 用 **PostgreSQL** 替代 MySQL | 追加 `postgres:12.3`、挂载 `init.sql`、引用 `docker.postgres.env` |
| `docker-compose.m1.yml` | Apple Silicon 适配 | 将 mysql 改为 `mariadb:10.5.8`，neo4j 改为 arm64 实验镜像 |

#### `docker-compose.dev.yml`（本地开发调试）

- **用途**：本地开发用 override，使用 `debug`/`head` 标签镜像，并开启 **JVM 远程调试**。
- **关键特性**：
  - 通过 `args: APP_ENV: dev` 构建开发镜像，**不打包二进制**，而是挂载本机已构建产物（jar/scripts）。
  - 暴露调试端口：前端 `5002`、GMS `5001`、upgrade `5003`（JDWP）。
  - 开启多项功能开关（`SHOW_BROWSE_V2`、`THEME_V2_ENABLED`、`SHOW_NAV_BAR_REDESIGN` 等）。
  - 挂载 `metadata-models`、`metadata-service/war` 等本地构建目录便于热替换。
- **前置条件**：必须先通过 Gradle 构建（`dev.sh` 注明 "YOU MUST BUILD VIA GRADLE BEFORE RUNNING THIS"）。

### 2.3 消费者（Consumers）文件

DataHub 的 Kafka 消费者（MAE/MCE）默认内置于 GMS 容器中，也可拆分为独立容器以提升可扩展性。

| 文件 | 作用 |
| --- | --- |
| `docker-compose.consumers.yml` | 定义独立 `datahub-mae-consumer`(9091)、`datahub-mce-consumer`(9090)，并在 GMS 上关闭内置消费者（`MAE/MCE_CONSUMER_ENABLED=false`）；含 Neo4j 依赖 |
| `docker-compose.consumers-without-neo4j.yml` | 同上，但不依赖 Neo4j，使用 without-neo4j env |
| `docker-compose.consumers.dev.yml` | 消费者开发调试 override，使用 `debug` 镜像并挂载本地 jar |

- **适用场景**：高吞吐/高可用部署，将元数据变更事件处理与 GMS 解耦，独立横向扩展消费者。

### 2.4 工具与辅助文件

| 文件 | 作用 |
| --- | --- |
| `docker-compose.tools.yml` | 运维调试工具：`kafka-rest-proxy`(8082)、`kafka-topics-ui`(18000→8000)、`kibana`(5601) |
| `docker-compose.kafka-setup.yml` | 空占位文件，kafka-setup 已并回主 compose，仅为向后兼容保留 |

### 2.5 启动脚本

| 脚本 | 作用 |
| --- | --- |
| `quickstart.sh` | 从 Docker Hub **拉取镜像**直接启动（不本地构建）。自动探测 Neo4j 数据卷决定使用哪份 compose；支持 `MONITORING`、`SEPARATE_CONSUMERS`、M1 自动叠加 |
| `dev.sh` | **本地构建**并启动开发环境，组合 `docker-compose.yml` + `override.yml` + `dev.yml` |
| `dev-with-cassandra.sh` | Cassandra 版开发环境 |
| `dev-without-neo4j.sh` | 无 Neo4j 版开发环境 |
| `nuke.sh` | `docker compose -p datahub down -v` 彻底删除容器、卷与网络 |

---

## 3. 服务镜像说明

### 3.1 DataHub 核心容器

| 服务名（hostname） | 镜像 | 端口 | 职责 |
| --- | --- | --- | --- |
| `datahub-frontend-react` | `acryldata/datahub-frontend-react:head` | 9002 | React 前端（Play 框架托管），消费 GraphQL API |
| `datahub-gms` | `acryldata/datahub-gms:head` | 8080 | 通用元数据服务（核心后端，REST/GraphQL/索引/存储） |
| `datahub-mce-consumer` | `acryldata/datahub-mce-consumer:head` | 9090 | 消费 MetadataChangeProposal/Event，写入存储 |
| `datahub-mae-consumer` | `acryldata/datahub-mae-consumer:head` | 9091 | 消费 MetadataChangeLog/AuditEvent，更新索引/图 |
| `datahub-actions` | `acryldata/datahub-actions:head-slim` | — | 事件驱动动作（Slack/Teams 通知、标签传播等） |
| `datahub-upgrade` | `acryldata/datahub-upgrade:head` | — | 一次性系统更新任务（`-u SystemUpdate`），负责 SQL 与索引初始化 |
| `kafka-setup` | `acryldata/datahub-kafka-setup:head` | — | 预创建 Kafka 主题（兼容旧客户端，多数情况非必需） |

> 说明：`datahub-upgrade` 在 `DATAHUB_SQL_SETUP_ENABLED=true` 时执行 SQL 与搜索索引的建立，
> 因此自 v1.5.0 起**不再需要**独立的 `mysql-setup`/`elasticsearch-setup`/`postgres-setup` 容器。

### 3.2 依赖服务容器

| 服务 | 默认镜像 | 端口 | 说明 |
| --- | --- | --- | --- |
| `mysql` | `mysql:8.2` | 3306 | 默认关系型元数据存储 |
| `postgres` | `postgres:12.3` | 5432 | MySQL 替代方案 |
| `mariadb` | `mariadb:10.5.8` | 3306 | M1/ARM64 下替代 MySQL |
| `cassandra` | `cassandra:3.11` | 9042 | 可选 NoSQL 主存储 |
| `elasticsearch` | `elasticsearch:7.16.1`（无 neo4j 版为 7.10.1） | 9200 | 搜索引擎（兼容 OpenSearch），可兼任图存储 |
| `neo4j` | `neo4j:4.4.9-community` | 7474/7687 | 图数据库（血缘/关系） |
| `broker` | `confluentinc/cp-kafka:7.9.2` | 9092/29092 | Kafka Broker |
| `zookeeper` | `confluentinc/cp-zookeeper:7.9.2` | 2181 | Kafka 协调 |
| `schema-registry` | `confluentinc/cp-schema-registry:7.9.2` | 8081 | Avro Schema 注册中心 |

> 大部分镜像版本通过环境变量可覆盖，如 `DATAHUB_SEARCH_TAG`、`DATAHUB_CONFLUENT_VERSION`、
> `DATAHUB_MYSQL_VERSION`、`DATAHUB_POSTGRES_VERSION` 等。

### 3.3 镜像变体（datahub-ingestion / datahub-actions）

| 变体 | 镜像大小 | 适用场景 |
| --- | --- | --- |
| `full`（默认） | 最大 | 全部连接器，最大兼容性 |
| `slim` | 中等 | 常用连接器，体积与功能平衡（推荐生产标准云栈） |
| `locked` | 中等 | 气隙（air-gapped）环境，禁用运行时 PyPI 安装 |

- 变体标签格式：`acryldata/datahub-ingestion:v0.x.y` / `-slim` / `-locked`。
- `datahub-ingestion` 基于 **Ubuntu 24.04**；`datahub-actions` 基于 **Wolfi**（`cgr.dev/chainguard/wolfi-base`）。
- **不要使用** `latest`/`debug` 标签做生产，推荐使用版本标签（如 `v0.8.40`）。

---

## 4. Dockerfile 解析

所有 JVM 服务的 Dockerfile 都采用 **多阶段构建** + `APP_ENV`（prod/dev）切换：
`prod-install` 阶段拷贝构建产物入镜像；`dev-install` 为空壳，依赖运行时挂载本地产物。

### 4.1 `datahub-gms/Dockerfile`

- **基础镜像**：`alpine:3.23`。
- **关键步骤**：
  1. 升级 Alpine 基础包，修复 CVE（zlib 固定 1.3.x、sqlite、c-ares、curl 等）。
  2. 安装 `openjdk17-jre-headless`、`bash`、`jattach`。
  3. 下载 OpenTelemetry javaagent（v2.27.0）与 JMX Prometheus javaagent（0.20.0）。
  4. 拷贝 `dockerize`（来自 `powerman/dockerize:0.24`）用于等待依赖就绪。
  5. `prod-install` 阶段：拷贝 `entity-registry.yml`、`start.sh`、`prometheus-config.yaml`、
     `war.war`。
  6. 创建非 root `datahub` 用户运行；`EXPOSE 8080`；`HEALTHCHECK` 调用 `/health`。
- **启动**：`CMD /datahub/datahub-gms/scripts/start.sh`。

### 4.2 `datahub-frontend/Dockerfile`

- **基础镜像**：`alpine:3.23` + OpenJDK17。
- **关键步骤**：拷贝 `start.sh`、Play 应用 stage 产物（`datahub-frontend/build/stage/main`）、
  多前端（MFE）配置 yaml。
- **端口**：`SERVER_PORT`（默认 9002，可构建参数覆盖）。
- **健康检查**：`curl /admin`。
- **启动**：`CMD ./start.sh`。

### 4.3 `datahub-upgrade/Dockerfile`

- **基础镜像**：`alpine:3.23` + OpenJDK17 + dockerize。
- **关键步骤**：拷贝 `datahub-upgrade.jar`、`start.sh`、`entity-registry.yml`、监控配置。
- **入口**：`ENTRYPOINT ["/datahub/datahub-upgrade/scripts/start.sh"]`（配合 compose 中
  `command: -u SystemUpdate`）。

### 4.4 `datahub-ingestion/Dockerfile`（Python 采集镜像）

- **基础镜像**：`ubuntu:24.04`，`PYTHON_VERSION=3.10`。
- **构建架构**：通过 `INLINE-BEGIN/END` 内联 `snippets/` 片段，分层导出多个 stage：
  - `python-base`：基础 Python + venv + uv（`astral-sh/uv`）。
  - `ingestion-base-slim`：增加 LDAP/Kerberos/ODBC 等系统依赖。
  - `ingestion-base-full`：在 slim 之上增加 JRE、build-essential、Oracle Instant Client。
  - `ingestion-base-locked`：等同 slim（无需 JRE/Oracle）。
- **代码与依赖安装**：`add-code-*` 拷贝 `metadata-ingestion` 并校验代码生成；`final-*` 用
  `uv pip install` 安装对应 extras：
  - `full`：`[all]` 全部连接器。
  - `slim`：常见连接器集合（snowflake/bigquery/redshift/mysql/postgres/s3/dbt/looker/tableau…）。
  - `locked`：最小集合，并将 `UV_INDEX_URL`/`PIP_INDEX_URL` 指向 `127.0.0.1:1` 阻断网络。
- **镜像源定制**：支持 `PIP_MIRROR_URL`、`PIP_EXTRA_INDEX_URL`、`UBUNTU_REPO_URL` 等构建参数，
  便于企业内网/镜像源场景。
- **入口**：`ENTRYPOINT [ "datahub" ]`。

### 4.5 `datahub-actions/Dockerfile`

- **基础镜像**：Wolfi（`cgr.dev/chainguard/wolfi-base`，可用 `WOLFI_BASE_IMAGE` 覆盖）。
- 提供 `full`/`slim`/`locked` 变体；内置 CLI 虚拟环境，支持 Slack/Teams/标签传播等动作。

> **企业内网构建提示**：GMS/Frontend/Upgrade 的 Dockerfile 均支持 `ALPINE_REPO_URL`、
> `GITHUB_REPO_URL`、`MAVEN_CENTRAL_REPO_URL` 参数切换为内部镜像源。

---

## 5. 环境变量配置（`env/` 目录）

### 5.1 GMS（`datahub-gms/env/`）

包含 `docker.env`（含 Neo4j）、`docker-without-neo4j.env`、`docker.cassandra.env`、
`docker.postgres.env`、`docker.mariadb.env`。核心变量：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `EBEAN_DATASOURCE_URL` | `jdbc:mysql://mysql:3306/datahub...` | 元数据库 JDBC 连接 |
| `EBEAN_DATASOURCE_USERNAME/PASSWORD` | datahub/datahub | 数据库账号 |
| `KAFKA_BOOTSTRAP_SERVER` | `broker:29092` | Kafka 地址 |
| `KAFKA_SCHEMAREGISTRY_URL` | `http://schema-registry:8081` | Schema Registry |
| `ELASTICSEARCH_HOST/PORT` | elasticsearch / 9200 | 搜索引擎 |
| `NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD` | bolt://neo4j / neo4j / datahub | 图数据库 |
| `GRAPH_SERVICE_IMPL` | `neo4j` 或 `elasticsearch` | 图存储实现切换 |
| `MAE_CONSUMER_ENABLED / MCE_CONSUMER_ENABLED / PE_CONSUMER_ENABLED` | true | 内置消费者开关 |
| `JAVA_OPTS` | `-Xms1g -Xmx1g` | JVM 内存 |

- **PostgreSQL override**（`docker.postgres.env`）：将 `EBEAN_DATASOURCE_URL` 改为
  `jdbc:postgresql://postgres:5432/datahub`，驱动改为 `org.postgresql.Driver`。
- 文件中含大量**注释开关**：OIDC SSO、ES SSL、Kafka 主题名、监控（Prometheus/OTel）、
  密钥加密（`SECRET_SERVICE_ENCRYPTION_KEY`）等。

### 5.2 前端（`datahub-frontend/env/docker.env`）

| 变量 | 说明 |
| --- | --- |
| `DATAHUB_GMS_HOST/PORT` | 指向 GMS（datahub-gms:8080） |
| `DATAHUB_SECRET` | 前端会话密钥 |
| `KAFKA_BOOTSTRAP_SERVER` / `DATAHUB_TRACKING_TOPIC` | 埋点事件 Kafka |
| `ELASTIC_CLIENT_HOST/PORT` | 分析数据 ES |
| `AUTH_OIDC_*`（注释） | OIDC 单点登录配置 |
| `DATAHUB_BASE_PATH`（注释） | 子路径部署支持 |

### 5.3 Actions（`datahub-actions/env/docker.env`）

- 系统认证：`DATAHUB_SYSTEM_CLIENT_ID/SECRET`。
- Kafka 安全协议、Schema Registry。
- Slack/Teams 集成变量（从宿主机透传，`*_ENABLED` 需设为 `true`）。

### 5.4 数据库/中间件 env

| 文件 | 关键变量 |
| --- | --- |
| `mysql/env/docker.env` | `MYSQL_DATABASE/USER/PASSWORD/ROOT_PASSWORD=datahub` |
| `postgres/env/docker.env` | `POSTGRES_USER/PASSWORD=datahub` |
| `broker/env/docker.env` | `KAFKA_ADVERTISED_LISTENERS`（broker:29092 内网 / localhost:9092 外部）、`KAFKA_HEAP_OPTS` |

---

## 6. 网络与端口映射

- **网络**：所有主 compose 统一使用自定义 bridge 网络 `datahub_network`（`networks.default.name`）。
- **端口映射**（默认值，多数可由 `DATAHUB_MAPPED_*` 环境变量覆盖）：

| 服务 | 容器端口 | 宿主端口（默认） | 覆盖变量 |
| --- | --- | --- | --- |
| frontend | 9002 | 9002 | `DATAHUB_MAPPED_FRONTEND_PORT` |
| GMS | 8080 | 8080 | `DATAHUB_MAPPED_GMS_PORT` |
| MCE consumer | 9090 | 9090 | — |
| MAE consumer | 9091 | 9091 | — |
| MySQL | 3306 | 3306 | `DATAHUB_MAPPED_MYSQL_PORT` |
| PostgreSQL | 5432 | 5432 | — |
| Elasticsearch | 9200 | 9200 | `DATAHUB_MAPPED_ELASTIC_PORT` |
| Neo4j | 7474 / 7687 | 7474 / 7687 | `DATAHUB_MAPPED_NEO4J_HTTP_PORT` / `..._BOLT_PORT` |
| Kafka broker | 9092 | 9092 | `DATAHUB_MAPPED_KAFKA_BROKER_PORT` |
| Zookeeper | 2181 | 2181 | `DATAHUB_MAPPED_ZK_PORT` |
| Schema Registry | 8081 | 8081 | `DATAHUB_MAPPED_SCHEMA_REGISTRY_PORT` |
| Cassandra | 9042 | 9042 | — |

- **调试端口**（dev）：frontend 5002、GMS 5001、upgrade 5003（JDWP）。
- **健康检查**：各服务均配置 `healthcheck`，并通过 `depends_on: condition: service_healthy`
  控制启动顺序（GMS 依赖 upgrade 完成 → upgrade 依赖 mysql/es/kafka-setup/neo4j 健康）。

---

## 7. 存储卷配置（数据持久化）

主 compose 中定义的命名卷：

| 卷名 | 挂载点 | 用途 |
| --- | --- | --- |
| `mysqldata` | `/var/lib/mysql` | MySQL 数据 |
| `postgresdata` | `/var/lib/postgresql/data` | PostgreSQL 数据 |
| `cassandradata` | `/var/lib/cassandra` | Cassandra 数据 |
| `esdata` | `/usr/share/elasticsearch/data` | Elasticsearch 索引 |
| `neo4jdata` | `/data` | Neo4j 图数据 |
| `broker` | `/var/lib/kafka/data/` | Kafka 日志 |
| `zkdata` | `/var/lib/zookeeper/data` | Zookeeper 数据 |
| `zklogs` | `/var/lib/zookeeper/log` | Zookeeper 事务日志（独立卷，见官方建议） |
| `grafana-storage` | `/var/lib/grafana` | Grafana 数据（监控） |

- **插件目录**：GMS/Frontend 均挂载宿主机 `${HOME}/.datahub/plugins:/etc/datahub/plugins`，
  用于自定义认证/插件。
- PostgreSQL override 额外挂载 `init.sql` 作为初始化脚本。

---

## 8. Profile（配置档）模式 —— `docker/profiles/`

`profiles/` 通过 Docker Compose 的 **include + profiles** 机制实现模块化按需启动。

### 8.1 组织结构

`docker-compose.yml`（profiles 目录）通过 `include` 聚合 4 个子文件：

```yaml
name: datahub
include:
  - docker-compose.prerequisites.yml   # 存储层：mysql/postgres/cassandra/kafka/es/neo4j 等
  - docker-compose.actions.yml         # Actions 容器
  - docker-compose.frontend.yml        # 前端容器
  - docker-compose.gms.yml             # GMS / system-update / 消费者
```

各服务通过 `profiles: [...]` 标签归类，启动时用 `--profile <名称>` 选择需要的组合。

### 8.2 Quickstart 系列 Profile

| Profile | MySQL | PG | Cassandra | Neo4j | Frontend | GMS | Actions | MAE | MCE |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| `quickstart` | X | | | | X | X | X | | |
| `quickstart-frontend` | X | | | | X | | | | |
| `quickstart-backend` | X | | | | | X | X | | |
| `quickstart-postgres` | | X | | | X | X | X | | |
| `quickstart-cassandra` | | | X | X | X | X | X | | |
| `quickstart-consumers` | X | | | | X | X | X | X | X |
| `quickstart-storage` | X | | | | | | | | |

（以上均含 Kafka + OpenSearch；`quickstart-consumers` 使用独立 MAE/MCE 消费者。）

### 8.3 Development（debug）系列 Profile

- 使用 `debug` 标签镜像（需先 `./gradlew dockerTagDebug` 本地构建），开启 JVM 调试，
  挂载本地 jar/脚本，可运行非默认组合（neo4j、cassandra、elasticsearch、localstack）。
- 主要 Profile：`debug`、`debug-frontend`、`debug-backend`、`debug-postgres`、
  `debug-cassandra`、`debug-consumers`、`debug-neo4j`、`debug-elasticsearch`、`debug-backend-aws`。

### 8.4 启动方式

```bash
# 方式一：直接使用 docker compose（需 compose >= 2.20）
cd docker/profiles
docker compose --profile quickstart up

# 方式二：使用 Gradle 封装任务（项目根目录）
./gradlew quickstart          # quickstart-consumers profile（默认全量+独立消费者）
./gradlew quickstartDebug     # debug profile（开发调试）
./gradlew quickstartCypress   # debug profile + 独立项目名 dh-cypress（测试隔离）
```

### 8.5 版本混合（高级）

可分别覆盖各组件版本以复现升级兼容性场景：

```bash
DATAHUB_MAE_VERSION="v0.15.1-SNAPSHOT" DATAHUB_MCE_VERSION="v0.15.1-SNAPSHOT" \
DATAHUB_VERSION="v0.14.1" ./gradlew quickstart
```

---

## 9. `quickstart/` 与 `monitoring/` 目录

### 9.1 `docker/quickstart/`

存放**合并展开后**的单文件 compose（由脚本从 profiles 生成，供 CLI/quickstart 使用）：

| 文件 | 说明 |
| --- | --- |
| `docker-compose.quickstart.yml` | 标准合并版（含 Neo4j） |
| `docker-compose-without-neo4j.quickstart.yml` | 无 Neo4j 合并版（quickstart.sh 默认） |
| `docker-compose-m1.quickstart.yml` / `...-without-neo4j-m1...` | Apple Silicon 版 |
| `docker-compose.consumers.quickstart.yml` / `...-without-neo4j...` | 独立消费者版 |
| `docker-compose.monitoring.quickstart.yml` | 监控叠加版 |
| `docker-compose.quickstart-profile.yml` | 基于 profile 的合并版 |
| `generate_docker_quickstart.py` / `.sh` | 由 profiles 生成合并 compose 的脚本 |
| `generate_and_compare.sh` | 校验生成结果与已提交文件一致性（CI 用） |
| `quickstart_version_mapping.yaml` | CLI 版本标签 → docker tag / git ref 映射 |

- **版本映射**：`quickstart_version_mapping.yaml` 的 `default` 指向 `v1.4.0`（docker_tag
  `v1.4.0.3`），`head` 指向 `master`。自 v1.5.0 起 setup 容器被移除，由 system-update 承担初始化。

### 9.2 `docker/monitoring/`

| 文件 | 说明 |
| --- | --- |
| `docker-compose.monitoring.yml` | 监控栈：`grafana`(3001→3000)、`prometheus`(9089→9090)、`jaeger-all-in-one`(16686)，并为 frontend/GMS 注入 OTel/Prometheus 环境变量 |
| `docker-compose.consumers.monitoring.yml` | 为独立消费者补充监控配置 |
| `prometheus.yaml` | Prometheus 抓取配置 |
| `client-prometheus-config.yaml` | JMX exporter 客户端配置（被各 JVM 服务挂载） |
| `grafana/` | Grafana 数据源与仪表盘 provisioning |

- 监控开启：服务设置 `ENABLE_PROMETHEUS=true`、`ENABLE_OTEL=true`，Trace 导出至 Jaeger。
- 启动：`MONITORING=true ./docker/quickstart.sh` 或叠加 `-f monitoring/docker-compose.monitoring.yml`。

---

## 10. 部署场景指南

### 10.1 最小化部署（仅存储层）

调试本机运行的 GMS/前端时，仅启动依赖数据存储：

```bash
docker compose --profile quickstart-storage up   # 仅 MySQL + Kafka + OpenSearch
# 或 ./gradlew quickstartStorage
```

### 10.2 标准部署（全功能，推荐）

```bash
# 拉取镜像直接启动（无 Neo4j，ES 兼任图存储）
cd docker && ./quickstart.sh
# 或 ./gradlew quickstart
```

### 10.3 高可用部署（独立消费者）

将 MAE/MCE 消费者从 GMS 拆分，独立扩展：

```bash
SEPARATE_CONSUMERS=true ./docker/quickstart.sh
# 或 docker compose --profile quickstart-consumers up
```

### 10.4 开发调试部署

```bash
# 先用 Gradle 构建产物，再启动 debug 镜像（开启 JVM 远程调试 + 本地挂载）
./gradlew quickstartDebug
# 或 cd docker && ./dev.sh
```

### 10.5 PostgreSQL 替代 MySQL

```bash
docker compose --profile quickstart-postgres up
# 或 ./gradlew quickstartPg
# 手动组合方式：
docker compose \
  -f docker-compose-without-neo4j.yml \
  -f docker-compose-without-neo4j.postgres.override.yml up
```

### 10.6 Cassandra 主存储

```bash
docker compose -f docker-compose-with-cassandra.yml up
```

### 10.7 Apple Silicon（M1/M2）

`quickstart.sh`/`dev.sh` 会自动检测 ARM64 Darwin 并叠加 `docker-compose.m1.yml`
（MySQL→MariaDB，Neo4j→arm64 实验镜像）。

### 10.8 启用监控

```bash
MONITORING=true ./docker/quickstart.sh
# 访问 Grafana http://localhost:3001，Jaeger http://localhost:16686
```

---

## 11. 常用命令速查

### 11.1 Compose 直接操作

```bash
# 启动（默认 datahub 项目名）
cd docker && docker compose -p datahub up -d

# 指定多文件组合启动
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# 查看状态 / 日志
docker compose -p datahub ps
docker compose -p datahub logs -f datahub-gms

# 停止
docker compose -p datahub down

# 彻底清理（含数据卷）
./docker/nuke.sh          # 或 docker compose -p datahub down -v
```

### 11.2 Gradle 任务

```bash
# 启动各类配置
./gradlew quickstart            # 标准（独立消费者）
./gradlew quickstartDebug       # 开发调试
./gradlew quickstartPg          # PostgreSQL
./gradlew quickstartSlim        # 仅后端
./gradlew quickstartStorage     # 仅存储层
./gradlew quickstartCypress     # Cypress 测试隔离环境

# 停止 / 重载
./gradlew quickstartDown        # 停止全部
./gradlew debugReload           # 重载 debug 环境

# 针对性清理（容器+卷）
./gradlew quickstartNuke        # 默认 datahub 命名空间
./gradlew quickstartDebugNuke   # debug 配置
./gradlew quickstartCypressNuke # cypress 配置（dh-cypress）
./gradlew quickstartPgNuke      # postgres 配置
```

> **命名空间提示**：大多数配置使用 `datahub` 项目命名空间；`quickstartCypress` 使用独立的
> `dh-cypress`，便于与主环境隔离。容器名通常为 `<项目名>-<服务名>-<序号>`。

### 11.3 镜像构建（一般无需手动，由 CI 完成）

```bash
# 构建全量镜像（依赖 BuildKit 多阶段构建）
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker compose -p datahub build

# 本地构建 debug 标签镜像（开发 profile 前置条件）
./gradlew dockerTagDebug
```

### 11.4 示例数据采集

```bash
./docker/ingestion/ingestion.sh
# 或
datahub docker ingest-sample-data
```

---

## 附录：关键设计要点小结

1. **多阶段 + APP_ENV**：所有 JVM 镜像统一 prod/dev 双模式，dev 通过挂载本地产物实现快速迭代。
2. **system-update 取代 setup 容器**：自 v1.5.0，SQL/索引初始化由 `datahub-upgrade`
   （`DATAHUB_SQL_SETUP_ENABLED=true`）完成。
3. **图存储可切换**：`GRAPH_SERVICE_IMPL` 可选 `neo4j` 或 `elasticsearch`，后者可省去 Neo4j 组件。
4. **存储后端可替换**：MySQL（默认）/ PostgreSQL / Cassandra / MariaDB(ARM)。
5. **消费者可拆分**：MAE/MCE 既可内置于 GMS，也可独立容器化以实现高可用与横向扩展。
6. **Profile 模块化**：`profiles/` 用 include + profiles 实现"积木式"按需组合，并由生成脚本
   导出为 `quickstart/` 下的合并 compose 供 CLI 使用。
7. **可观测性内建**：通过 `monitoring/` 一键叠加 Prometheus + Grafana + Jaeger（OTel）。
8. **企业内网友好**：Dockerfile 支持 Alpine/Ubuntu/Maven/GitHub/PyPI 镜像源参数化覆盖。
```
