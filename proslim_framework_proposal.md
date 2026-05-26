# ProSlim-Microbiome-AI：基于公开数据库的益生菌减脂组合智能预测系统
## 编程框架与系统设计方案

本项目旨在构建一个分阶段、可扩展、可验证的 AI 建模系统，旨在基于公开肠道微生物组和干预数据预测肥胖相关菌群状态、干预响应概率，并最终推荐个性化的益生菌组合。以下为该系统的可执行编程框架方案。

---

## 一、 系统目录结构 (Directory Structure)

在项目初始化阶段，开发人员应在工作空间创建如下的软件目录结构，以便各模块的代码与数据能规范化读取与存储：

```text
ProSlim-Microbiome-AI/
├── config/                         # 参数配置文件目录
│   ├── database_config.yaml        # 数据库下载地址与凭证配置
│   ├── filtering_rules.yaml        # 样本筛选与 QC 阈值配置
│   ├── feature_config.yaml         # 特征选择与派生特征权重配置
│   └── model_config.yaml           # 模型超参数、交叉验证与权重配置
├── data/                           # 数据目录（不提交至 Git 仓库）
│   ├── raw_data/                   # 模块一：原始下载数据
│   ├── metadata/                   # 模块二：统一清洗后的元数据
│   ├── taxonomic_profile/          # 模块二：清洗后的分类丰度表
│   ├── functional_profile/         # 模块二：清洗后的功能通路表
│   ├── intervention_data/          # 模块二：清洗后的临床干预与结局表
│   ├── strain_genome/              # 模块二：清洗后的候选菌株基因组与功能表
│   ├── literature_database/        # 模块二：文献证据库 CSV
│   └── processed_data/             # 模块三/四：合并、质控、特征构建后的建模矩阵
├── scripts/                        # 功能模块脚本目录
│   ├── data_download.py            # 模块一：数据获取脚本
│   ├── metadata_cleaning.py        # 模块二：元数据整理与标准化脚本
│   ├── data_filtering_qc.py        # 模块三：数据过滤、质量控制与批次效应消除脚本
│   ├── feature_engineering.py      # 模块四：菌群特征、多样性、派生特征构建脚本
│   ├── obesity_model.py            # 模块五：肥胖预测与特征分析模型脚本
│   ├── responder_model.py          # 模块六：干预响应分类与多任务学习模型脚本
│   ├── strain_annotation.py        # 模块七：候选菌株安全性门槛与功能评分脚本
│   ├── combination_recommend.py    # 模块八：组合生成、多维度评分与推荐排序脚本
│   └── visualization.py            # 模块九：可视化与自动化报告生成脚本
├── models/                         # 训练好的模型序列化文件（如 .pkl, .joblib）
│   ├── obesity_classifier/         # 肥胖二分类/多分类模型
│   ├── BMI_regressor/              # BMI 连续值回归模型
│   ├── responder_classifier/       # 益生菌干预响应预测模型
│   └── combination_ranker/         # 组合综合排序模型
├── results/                        # 模型输出结果与分析报告
│   ├── feature_importance/         # 关键特征、权重与贡献度输出
│   ├── SHAP_results/               # SHAP 解释性数据与解释图
│   ├── candidate_strain_scores/    # 候选单菌株评分结果
│   ├── combination_ranking/        # 推荐的益生菌组合排序表
│   └── reports/                    # 四类最终输出报告与可视化 PDF/HTML
└── README.md                       # 项目说明文档
```

---

## 二、 模块详细设计方案

### 模块一：数据获取模块 (Data Acquisition)
* **模块目标**：从公开数据库中获取多维度多模态原始数据，支持增量下载和断点续传。
* **技术栈/实现工具**：
  * R 语言 `curatedMetagenomicData` 包（用于自动化获取人体宏基因组丰度及临床元数据）。
  * Python `requests`, `BeautifulSoup`（用于爬取/解析文献中的补充表格）。
  * Python `Entrez` (Biopython)（用于访问 NCBI SRA/ENA 数据库获取测序元数据与 Genome 基因组）。
  * Command Line: `Aspera Connect` 或 `sra-tools`（下载 SRA 原始测序数据）。
* **输入文件与参数**：
  * 输入参数文件：`config/database_config.yaml`（包含要拉取的 Study ID 列表、NCBI API Key 等）。
* **输出数据与格式**：
  * 宿主横断面数据：`data/raw_data/raw_host_metadata.csv`（包含 Study Accession、BMI 等原始列）。
  * 宏基因组丰度表：`data/raw_data/raw_metagenome_taxa.tsv` 和 `raw_metagenome_pathway.tsv`。
  * 候选菌株基因组：`data/raw_data/genomes/[strain_id].fna`（FASTA 格式）。
  * 微生物组-代谢组配对表：`data/raw_data/raw_metabolome_paired.csv`。
  * 文献数据库表：`data/raw_data/raw_literature_evidence.xlsx`。

---

### 模块二：元数据整理模块 (Metadata Curation)
* **模块目标**：将不同数据源、单位、格式的表格归一化为标准的结构化数据表，建立关系映射。
* **技术栈/实现工具**：Python `pandas`, R `tidyverse` (dplyr, readr)。
* **输入文件**：模块一输出的 `data/raw_data/` 下所有原始 CSV/TSV/XLSX 文件。
* **输出数据与格式**（核心数据表设计）：

#### 表 1：样本元数据表 `data/metadata/sample_metadata_clean.csv`
| 字段名 | 数据类型 | 允许值/范围 | 说明 |
| :--- | :--- | :--- | :--- |
| `sample_id` | String | 主键 (Unique) | 样本唯一标识符 (例如 SERR001234) |
| `subject_id` | String | 外键 | 受试者唯一标识符 |
| `study_id` | String | 外键 | 研究队列编号 (例如 PRJNAXXXX) |
| `database_source`| Categorical | `curatedMetagenomicData`/`GMrepo`/`NCBI_SRA`/`Qiita` | 数据来源库 |
| `sequencing_type`| Categorical | `16S` / `shotgun` | 测序类型 |
| `body_site` | String | 默认 `feces` | 样本采集部位 |
| `time_point` | Categorical | `baseline` / `post` / `follow-up` | 采样时间点 |
| `age` | Float | 0.0 - 120.0 | 年龄（岁），缺失存为 `NaN` |
| `sex` | Categorical | `male` / `female` / `unknown` | 性别 |
| `BMI` | Float | 10.0 - 60.0 | 体质指数 ($kg/m^2$) |
| `obesity_status` | Categorical | `lean` / `overweight` / `obesity` | 肥胖状态划分（根据 BMI 阈值归一化） |
| `disease_status` | Categorical | `healthy`/`obesity`/`T2D`/`NAFLD`/`metabolic_syndrome`| 伴随代谢疾病状态 |
| `country` | Categorical | ISO 国家代码 (例如 `CHN`, `USA`) | 受试者所在国家 |
| `region` | String | 地区名称 | 具体地区 |
| `raw_read_count` | Integer | > 0 | 测序原始 Read 数 |
| `antibiotic_use` | Boolean | `True` / `False` / `NaN` | 近期（如 1-3 个月）是否使用抗生素 |
| `diet_info_available`| Boolean| `True` / `False` | 是否包含饮食记录数据 |
| `intervention_available`|Boolean| `True` / `False` | 是否为干预研究样本 |

#### 表 2：菌群组成表 `data/taxonomic_profile/taxonomic_profile_clean.csv`
| 字段名 | 数据类型 | 允许值/范围 | 说明 |
| :--- | :--- | :--- | :--- |
| `sample_id` | String | 外键 | 样本唯一标识符 |
| `taxon_level` | Categorical | `genus` / `species` | 菌群分类层级 |
| `taxon_name` | String | 统一的 NCBI 命名规范 | 菌属或菌种标准名称 |
| `relative_abundance`| Float | 0.0 - 1.0 | 相对丰度占比 (Sum to 1 per level/sample) |
| `database_source`| Categorical | - | 对应数据来源 |
| `profiling_method`| Categorical | `MetaPhlAn3`/`MetaPhlAn4`/`QIIME2_DADA2`/`Kraken2`| 丰度定量分析工具 |

#### 表 3：功能通路表 `data/functional_profile/functional_profile_clean.csv`
| 字段名 | 数据类型 | 说明 |
| :--- | :--- | :--- |
| `sample_id` | String | 外键，关联样本 |
| `pathway_id` | String | 标准通路编号 (如 MetaCyc PWY-5100, KEGG map00010) |
| `pathway_name` | String | 通路名称描述 |
| `pathway_database`| Categorical | `MetaCyc` / `KEGG` / `eggNOG` | 功能参考数据库 |
| `abundance` | Float | 丰度值 (例如 HUMAnN3 RPKM) |
| `coverage` | Float (0-1) | 通路覆盖度 (如有) |
| `annotation_method`| Categorical | `HUMAnN3` / `MGnify` | 注释流程名称 |

#### 表 4：干预信息表 `data/intervention_data/intervention_metadata_clean.csv`
| 字段名 | 数据类型 | 说明 |
| :--- | :--- | :--- |
| `study_id` | String | 外键，关联研究编号 |
| `subject_id` | String | 外键，关联受试者编号 |
| `intervention_type`| Categorical | `probiotic` / `prebiotic` / `synbiotic` / `diet` | 干预类型 |
| `probiotic_species`| String | 干预的益生菌种名（多株用分号 `;` 隔开） |
| `probiotic_strain` | String | 干预的特定益生菌株名称（如 L. rhamnosus GG） |
| `number_of_strains`| Integer | 干预菌株总数（单菌 vs. 复合菌） |
| `total_CFU_per_day`| Float | 日总摄入活菌数 (CFU/day) |
| `log10_CFU_per_day`| Float | 日总摄入活菌数 log10 转换值 |
| `strain_specific_CFU`| String | 各单株的日摄入活菌数配置 |
| `prebiotic_type` | String | 搭配的益生元名称（如菊粉、低聚果糖等） |
| `prebiotic_dose_g_day`| Float | 益生元每日摄入剂量 (g/day) |
| `duration_weeks` | Float | 干预时长（周） |
| `dosage_form` | Categorical | `capsule` / `powder` / `yogurt` / `fermented_milk` | 剂型 |
| `placebo_type` | String | 安慰剂类型说明 |

#### 表 5：临床结局表 `data/intervention_data/clinical_outcome_clean.csv`
| 字段名 | 数据类型 | 说明 |
| :--- | :--- | :--- |
| `subject_id` | String | 外键，关联受试者 |
| `study_id` | String | 外键，关联研究 |
| `baseline_weight` | Float | 基线体重 (kg) |
| `post_weight` | Float | 干预后体重 (kg) |
| `weight_change` | Float | 体重变化值 (post - baseline) |
| `weight_change_percent`| Float | 体重变化百分比 % |
| `baseline_BMI` | Float | 基线 BMI |
| `post_BMI` | Float | 干预后 BMI |
| `BMI_change` | Float | BMI 变化值 |
| `waist_change` | Float | 腰围变化值 (cm) |
| `body_fat_change` | Float | 体脂率变化百分比 % |
| `TG_change` | Float | 甘油三酯变化值 (mmol/L) |
| `TC_change` | Float | 总胆固醇变化值 (mmol/L) |
| `LDL_change` | Float | 低密度脂蛋白胆固醇变化值 (mmol/L) |
| `HDL_change` | Float | 高密度脂蛋白胆固醇变化值 (mmol/L) |
| `FBG_change` | Float | 空腹血糖变化值 (mmol/L) |
| `FINS_change` | Float | 空腹胰岛素变化值 ($\mu IU/mL$) |
| `HOMA_IR_change` | Float | HOMA-IR 变化值 |
| `inflammatory_marker_change`| String | 关键炎症因子（如 IL-6, TNF-alpha）变化描述 |
| `responder_label` | Boolean | 根据规则计算的响应者标签 (True/False) |

#### 表 6：候选菌株功能表 `data/strain_genome/strain_function_matrix_clean.csv`
| 字段名 | 数据类型 | 说明 |
| :--- | :--- | :--- |
| `strain_id` | String | 唯一菌株编号 |
| `genus` | String | 属名 |
| `species` | String | 种名 |
| `strain_name` | String | 株名 |
| `genome_accession`| String | NCBI Assembly Accession (如 GCF_000008865.2) |
| `safety_gate` | Boolean | 是否通过安全门槛认证 (True = Pass, False = Fail) |
| `AMR_risk` | Integer | 预测的耐药基因数量 |
| `virulence_risk` | Integer | 预测的毒力因子数量 |
| `BSH_potential` | Float | 胆盐水解酶（BSH）基因相对丰度或活性预测值 |
| `SCFA_potential` | Float | 短链脂肪酸关键酶通路完整度评分 (0.0 - 1.0) |
| `carbohydrate_utilization`| String | 可利用糖类/膳食纤维列表 (以分号分隔) |
| `mucin_adhesion_potential`| Float | 黏附相关域蛋白评分 |
| `EPS_potential` | Float | 胞外多糖合成基因完整度 |
| `anti_inflammatory_evidence`| String | 体外/动物抗炎实验证据概述 |
| `literature_weight_loss_evidence`| Categorical | 减脂证据等级 (`High` / `Medium` / `Low` / `None`) |
| `probiotic_use_history`| Boolean | 是否存在安全食用历史 (如中国可用于婴幼儿/食品的菌种清单) |

---

### 模块三：数据筛选与质量控制模块 (Filtering & Quality Control)
* **模块目标**：剔除低质量样本与不合格干预数据，统一指标度量，消除多中心批次效应。
* **技术栈/实现工具**：Python `pandas`, R `sva`包中的 `ComBat` 算法或 Python `pycombat`。
* **筛选与清洗算法逻辑**：
  1. **样本硬筛选**：
     * `body_site == 'feces'`。
     * 剔除 `BMI` 且 `obesity_status` 均为缺失的横断面样本。
     * 干预样本必须具有 `time_point == 'baseline'` 与 `time_point == 'post'` 配对对齐。
     * 排除 `antibiotic_use == True` 的样本。
  2. **字段单位归一化**：
     * BMI 计算公式统一：$BMI = 体重(kg) / [身高(m)]^2$。
     * 剂量转换：$log10\_CFU\_per\_day = log_{10}(total\_CFU\_per\_day)$。
     * 周期转换：干预天数除以 7 转换为周数。
  3. **缺失值估算规则**：
     * 对于协变量（如 `age`、`sex`），分类变量缺失用 `unknown` 填充，数值变量缺失用中位数填充，并同时在衍生列 `[col]_imputed` 中标记为 1。
  4. **批次效应校正**：
     * 提取 `study_id` 和 `profiling_method` 作为批次变量。
     * 对菌群相对丰度数据进行 $log(x + \epsilon)$ 转换或 $CLR$（Centered Log-Ratio）转换，使用 `ComBat` 算法进行批次效应去除。
* **输入文件**：模块二输出的 6 个 Clean CSV 文件。
* **输出数据与格式**：
  * 建模元数据表：`data/processed_data/sample_metadata_filtered.csv`。
  * 批次校正后的菌丰度宽矩阵：`data/processed_data/taxonomic_abundance_matrix.csv`（格式：`sample_id` 作为行，各微生物 Taxon 丰度作为列）。
  * 批次校正后的通路丰度宽矩阵：`data/processed_data/functional_abundance_matrix.csv`。

---

### 模块四：微生物组特征构建模块 (Feature Engineering)
* **模块目标**：将物种与通路数据转化为可直接用于机器学习算法的数值特征矩阵，计算代表生态演替与代谢活性的机制衍生指标。
* **技术栈/实现工具**：Python `scikit-bio`, R `vegan`, `phyloseq`。
* **派生特征计算公式**：
  1. **Alpha 多样性特征**：
     * Shannon 指数：$H' = - \sum (p_i \ln p_i)$。
     * Richness（丰富度）：检测到的物种总数。
     * Pielou 均匀度：$J = H' / \ln(\text{Richness})$。
  2. **Prevotella / Bacteroides (P/B) 比例**：
     * $P/B\_ratio = \log_{10}(\frac{Abundance_{Prevotella} + 1e-5}{Abundance_{Bacteroides} + 1e-5})$。
  3. **SCFA 功能潜力评分 ($Score_{SCFA}$)**：
     * 乙酸/丙酸/丁酸合成通路（如 MetaCyc 中丁酸合成通路 `PWY-5676`、`CENTDEG-PWY` 等）丰度之和。
  4. **胆汁酸转化功能评分 ($Score_{BA}$)**：
     * HUMAnN3 功能注释中，EC 3.5.1.24（胆盐水解酶 BSH）及 $7\alpha$-去羟基化酶相关基因的丰度加和。
  5. **丁酸菌丰度评分 ($Score_{Butyrate}$)**：
     * $Faecalibacterium$ + $Roseburia$ + $Eubacterium$ + $Coprococcus$ 的相对丰度之和。
* **输入文件**：模块三输出的过滤与校正后的矩阵。
* **输出数据与格式**：
  * 特征矩阵表：`data/processed_data/microbiome_features.csv`（列包括：`sample_id`、所有的 Alpha 多样性指标、P/B比例、SCFA功能评分、胆汁酸评分、丁酸菌评分、肠型分类、以及筛选后的关键门/属/种的 CLR 丰度值）。

---

### 模块五：肥胖相关菌群状态预测模型 (Obesity Prediction Model)
* **模块目标**：构建以肠道微生物特征预测宿主肥胖状态的回归与分类模型，输出表示“肠道菌群肥胖倾向”的微生态风险评分（Obesity Microbiome Score, OMS）。
* **技术栈/实现工具**：Python `scikit-learn`, `xgboost`, `lightgbm`, `shap`。
* **模型架构与训练逻辑**：
  1. **回归模型 (BMI Regressor)**：以 `microbiome_features.csv` + 宿主 `age`, `sex` 为输入特征，预测连续值 `BMI`。
  2. **分类模型 (Obesity Classifier)**：预测二分类 `obesity vs lean` 以及多分类。
  3. **特征筛选**：利用 Elastic Net（L1 正则化）去除共线性冗余特征，保留稳健特征；用 Random Forest / LightGBM 拟合非线性关系。
  4. **验证方式**：采用 **留一研究验证 (Leave-One-Study-Out Cross-Validation, LOSO-CV)**，即每次用一个 `study_id` 的所有样本做测试集，其余研究的数据做训练集，严格评估模型的跨队列泛化能力。
  5. **肥胖菌群风险评分 (OMS) 定义**：对于任意新样本，其 OMS 定义为分类模型预测其属于 "obesity" 的概率概率值 (0.0 - 1.0)。
* **输入数据**：`data/processed_data/microbiome_features.csv`（仅筛选横断面研究样本，`intervention_available == False`）。
* **输出数据与格式**：
  * 模型文件：`models/obesity_classifier/lgb_model.joblib` 等。
  * 特征重要性与贡献：`results/feature_importance/obesity_feature_weights.csv`（包含特征名、回归系数、LightGBM 分裂增益、平均 SHAP 值）。
  * 样本 OMS 预测值表：`results/prediction_results/samples_oms_scores.csv`（含 `sample_id`、真实 `BMI`、真实标签、预测 `BMI`、预测概率即 `OMS`）。

---

### 模块六：益生菌干预响应预测模型 (Probiotic Intervention Response Model)
* **模块目标**：基于受试者的基线（baseline）微生态与宿主代谢特征，预测其在接受特定益生菌干预后体重/代谢指标改善的概率。
* **技术栈/实现工具**：Python `scikit-learn` (Multi-task learning, LogisticRegression), `xgboost`, `lightgbm`。
* **模型架构与指标**：
  1. **输入特征**：
     * 基线宿主变量：`baseline_weight`、`baseline_BMI`、`age`、`sex` 等。
     * 基线菌群特征：基线样本的各菌属丰度、Alpha 多样性、衍生功能评分（SCFA, BA）。
     * 干预配置参数：`probiotic_species`、`log10_CFU_per_day`、`duration_weeks`、`prebiotic_type`、`prebiotic_dose_g_day`。
  2. **多任务响应标签 (Multi-task Targets)**：
     * 体重响应者 (`weight_response_label`)：干预后体重下降率 $\ge 3\%$ 或绝对体重下降 $\ge 2kg$（定义为 1，否则为 0）。
     * 脂代谢响应者 (`lipid_response_label`)：`TG` 或 `LDL` 下降 $\ge 10\%$。
     * 综合响应者 (`composite_response_label`)：体重与脂代谢至少一项显著改善。
  3. **算法实现**：使用多任务随机森林或 Multi-output Gradient Boosting Classifier，同时输出多个响应目标的预测概率。
  4. **验证方式**：按 `study_id` 进行留一研究交叉验证 (LOSO-CV)，确保推荐模型能够推广到全新的干预临床试验中。
* **输入数据**：`data/processed_data/` 下包含干预且时间点配对的样本集特征。
* **输出数据与格式**：
  * 模型文件：`models/responder_classifier/multitask_gbdt.joblib`。
  * 预测响应概率：`results/prediction_results/intervention_predicted_responses.csv`（包含 `subject_id`、不同目标的预测响应概率 $P_{weight\_response}$、$P_{lipid\_response}$、$P_{composite\_response}$）。

---

### 模块七：候选菌株功能匹配模块 (Strain Functional Profiling)
* **模块目标**：通过生物信息学流程对候选益生菌菌株的基因组进行安全准入评估，并量化其与减脂相关的代谢和黏附功能潜力。
* **技术栈/实现工具**：
  * 耐药基因筛查：`ResFinder` / `CARD` 数据库比对。
  * 毒力基因筛查：`VFDB` 数据库比对。
  * 移动元件与质粒检测：`PlasmidFinder`、`ISFinder`。
  * 代谢功能注释：`eggNOG-mapper`（注释 BSH 酶、SCFA 合成关键酶，如丁酸激酶 `buk`、丁酰辅酶 A：乙酰辅酶 A 转移酶 `but` 等）；`dbCAN3`（注释碳水化合物利用酶 CAZymes，评估益生元底物利用能力）。
* **安全性准入硬过滤规则 (Safety Gate)**：
  * 是否有可转移（位于质粒/移动元件上）的临床抗生素耐药基因 = 0。
  * 是否含有高风险人类毒力因子/毒素基因 = 0。
  * 必须具有长期的食品级安全使用历史（如 QPS/GRAS 目录中列出）或通过体外溶血与细胞毒性实验检测。
  * 以上条件有一项不满足，则 `safety_gate = False`，一票否决，不再进入推荐流。
* **功能评分指标计算**：
  * **SCFA 潜力值评分 ($Score_{strain\_SCFA}$)**：乙酸/丙酸/丁酸合成通路核心酶的基因完整度（0.0 - 1.0）。
  * **BSH 活性潜力 ($Score_{strain\_BSH}$)**：基因组中 BSH 基因拷贝数与比对序列一致性的加权值。
  * **底物匹配度**：输出该菌株能高效降解的纤维底物集合（例如菊粉、低聚乳糖等）。
* **输入数据**：候选益生菌的基因组序列文件 `data/raw_data/genomes/*.fna`，以及文献提取的表型证据库。
* **输出数据与格式**：
  * 菌株功能与安全性评估表：`results/candidate_strain_scores/strain_function_matrix_results.csv`（每一行为一株候选菌，列包含 `strain_id`、`safety_gate`、各功能维度评分）。

---

### 模块八：益生菌组合推荐模块 (Combination Recommendation)
* **模块目标**：在满足安全性限制的前提下，通过组合优化算法生成多菌株干预组合（2-4株），并根据目标人群的菌群缺失特征、菌株功能互补性以及文献和模型预测概率对组合进行优先级排序。
* **技术栈/实现工具**：Python 组合搜索优化（如使用 `itertools` 遍历可能空间，辅以剪枝规则）。
* **核心推荐与排序算法**：
  1. **组合剪枝规则**：
     * 组合内所有菌株必须满足 `safety_gate == True`。
     * 排除菌种完全相同、仅株号不同的高度功能冗余组合。
     * 组合内必须至少包含一株具有长期安全食用历史的经典菌株（如双歧杆菌或乳杆菌），以作为“配方基石”。
  2. **多指标融合评分公式**：
     对于一个特定的候选组合 $C$，其在目标人群 $P$ 中的综合推荐评分 $Score(C, P)$ 评估如下：
     $$Score(C, P) = \prod_{s \in C} \text{Safety}(s) \times \left[ w_1 \cdot S_{complementary}(C) + w_2 \cdot S_{match}(C, P) + w_3 \cdot S_{response}(C) + w_4 \cdot S_{literature}(C) + w_5 \cdot S_{feasibility}(C) \right]$$
     * $\text{Safety}(s)$：安全门槛，通过为 1，不通过为 0。
     * $S_{complementary}(C)$：**功能互补评分**。量化组合中各菌株在功能（SCFA、BSH、黏附、抗炎、益生元利用）上的互补度。若菌株 A 产丁酸，菌株 B 产丙酸，菌株 C 具有高黏附力且能利用菊粉，则互补分极高；若功能高度重叠则评分低。
     * $S_{match}(C, P)$：**人群匹配评分**。比对目标人群 $P$ 在模块五中识别出的缺陷特征。例如，若人群 $P$ 存在严重的丁酸通路缺陷，而组合 $C$ 中包含强效产丁酸菌，则匹配度分值升高。
     * $S_{response}(C)$：**干预响应预测评分**。来自模块六 of 干预模型，将该组合作为干预参数输入，预测目标人群的体重改善概率 $P_{weight\_response}$。
     * $S_{literature}(C)$：**文献证据评分**。基于组合内各菌株或其同种菌株已发表的减脂 RCT 文献证据级别（High/Medium/Low）计算加权得分。
     * $S_{feasibility}(C)$：**可验证与工艺评分**。由共培养难度、对氧气敏感度、冻干存活率等工业可行性参数决定（来自于 `config/scoring_weights.yaml` 中的经验参数）。
* **输入数据**：
  * `results/candidate_strain_scores/strain_function_matrix_results.csv`
  * 目标人群（或个体）的基线特征 `microbiome_features.csv`
  * 权重配置文件 `config/scoring_weights.yaml`
* **输出数据与格式**：
  * 益生菌组合推荐清单：`results/combination_ranking/top_combination_recommendations.csv`（包含组合 ID、菌株组成、各子维度得分、综合得分、建议益生元配伍）。

---

### 模块九：结果解释与可视化模块 (Interpretation & Visualization)
* **模块目标**：将复杂的多组学和机器学习模型预测结果转化为临床医生、配方研发专家和实验人员易于理解的直观图表和自动化结构化报告。
* **技术栈/实现工具**：Python `matplotlib`, `seaborn`, `shap` 绘图包，或 R `ggplot2`。
* **自动生成的图表清单**：
  1. **肥胖菌群标志物 SHAP 总结图**：展示对 BMI 预测贡献最大的前 20 个菌属/菌种及通路，标明正负相关性。
  2. **响应者基线特征热图**：展示响应人群与非响应人群基线菌群丰度的聚类差异，明确干预受益窗口。
  3. **菌株功能雷达图**：展示候选单菌株在安全、SCFA、BSH、黏附、抗炎、可利用糖类 6 个维度的功能雷达图。
  4. **组合功能覆盖矩阵图**：展示推荐的 top 5 组合中，各个菌株如何分工覆盖目标缺失通路。
  5. **实验验证优先级泡泡图**：横坐标为响应预测评分，纵坐标为功能互补评分，气泡大小代表文献证据强度，帮助实验人员直观挑选验证组合。
* **输入数据**：前述各模块的所有结果 CSV 文件。
* **输出数据与格式**：
  * 可视化图表文件：`results/reports/figures/*.pdf` 或 `*.png`。
  * 结构化最终报告：`results/reports/ProSlim_Recommendation_Report.html`（交互式网页报告）或 `.pdf`。

---

## 三、 分阶段执行计划 (Execution Roadmap)

为了系统地推进本项目，建议将整个预测系统的开发划分为以下四个阶段进行：

### 1. 第一阶段：基础多组学数据库构建（1-35 天）
* **核心目标**：建立归一化、标准化的肥胖与干预多组学原始数据库。
* **具体任务**：
  * 下载并清洗 `curatedMetagenomicData` 中包含 BMI 的粪便样本数据。
  * 统一元数据单位（BMI、年龄、性别、国家），剔除无效与抗生素干扰样本。
  * 构建统一的物种分类丰度矩阵与功能通路矩阵。
* **阶段性产出文件**：
  * `data/metadata/sample_metadata_clean.csv`
  * `data/taxonomic_profile/taxonomic_profile_clean.csv`
  * `data/functional_profile/functional_profile_clean.csv`

### 2. 第二阶段：肥胖菌群状态模型与特征提取（36-70 天）
* **核心目标**：训练高泛化能力的肥胖预测模型，锁定核心靶向菌群与功能通路。
* **具体任务**：
  * 计算多样性指标、P/B 比例及派生的 SCFA/BA 机制特征。
  * 训练以菌群特征预测宿主 BMI 和肥胖分类的 Elastic Net、Random Forest、XGBoost 及 LightGBM 模型。
  * 运行 LOSO-CV，提取跨队列一致的肥胖菌群特征和通路。
  * 为所有样本计算并输出“肠道菌群肥胖风险评分 (OMS)”。
* **阶段性产出文件**：
  * `models/obesity_classifier/lgb_model.joblib`
  * `results/feature_importance/obesity_feature_weights.csv`
  * `results/prediction_results/samples_oms_scores.csv`

### 3. 第三阶段：益生菌干预响应预测模型构建（71-115 天）
* **核心目标**：构建“受试者基线特征 + 干预配置 $\rightarrow$ 减脂结局响应”的预测模型。
* **具体任务**：
  * 整理公开的益生菌、合生元及饮食干预临床研究的宏基因组测序与临床结局数据。
  * 提取受试者基线菌群特征，对齐体重、BMI、腰围、血脂血糖的干预前后变化值，定义多维度响应者标签。
  * 训练多任务梯度提升树模型，预测特定受试者在特定干预配置下的响应概率。
* **阶段性产出文件**：
  * `data/intervention_data/intervention_metadata_clean.csv`
  * `data/intervention_data/clinical_outcome_clean.csv`
  * `models/responder_classifier/multitask_gbdt.joblib`

### 4. 第四阶段：菌株功能匹配、组合推荐与报告输出（116-165 天）
* **核心目标**：建立候选菌株数据库，运行多指标组合排序算法，输出实验验证方案与图形报告。
* **具体任务**：
  * 对收集到的候选益生菌进行全基因组生物信息学筛查，建立安全准入表（AMR、毒力因子筛查）与代谢功能评分表（BSH、SCFA酶、CAZymes 降解谱）。
  * 编写组合优化算法，遍历生成并筛选通过安全门槛的多菌株组合，基于人群缺失、功能互补、干预响应预测和文献证据进行多指标综合评分。
  * 运行可视化脚本，渲染四类最终系统报告，将 Top 10-20 的菌株组合输出为体外共培养、模拟发酵与高脂小鼠实验方案。
* **阶段性产出文件**：
  * `results/candidate_strain_scores/strain_function_matrix_results.csv`
  * `results/combination_ranking/top_combination_recommendations.csv`
  * `results/reports/ProSlim_Recommendation_Report.html`

---

## 四、 最终系统输出报告定义 (Final Reports)

系统运行结束后，应当在 `results/reports/` 目录下为决策者和实验人员生成以下四类规范化报告：

### 报告 1：肥胖菌群状态评估报告 (Obesity Microbiome Status Report)
* **内容要素**：
  * 受试者/样本整体的 **肠道菌群肥胖风险评分 (OMS)** 及其在公开人群分布中的百分位数。
  * 关键缺失菌群清单（如：$Akkermansia$ 或 $Faecalibacterium$ 的相对丰度低于正常人群的 5% 分位数）。
  * 短链脂肪酸（SCFA）合成通路与胆汁酸代谢通路的功能缺陷评估。
  * 辅助决策建议（是否属于“菌群失调介导的肥胖”）。

### 报告 2：益生菌响应预测报告 (Probiotic Response Prediction Report)
* **内容要素**：
  * 预测该受试者对经典益生菌干预的 **体重响应概率** $P_{weight}$、**脂代谢响应概率** $P_{lipid}$ 及 **综合响应概率**。
  * 预测的最佳干预窗口期（推荐干预时长，如：12 周 vs. 24 周）。
  * 基于基线肠型（如 Prevotella 优势型）推荐的粗粮/膳食纤维搭配底物。
  * 响应与不响应的机制解析（基于 SHAP 归因解释）。

### 报告 3：候选单菌株评分报告 (Candidate Strain Profiling Report)
* **内容要素**：
  * **安全性筛查结果**：耐药基因比对清单、毒力因子预测、是否通过安全门槛的二分类结论（Pass/Fail）。
  * **核心功能打分**：BSH 活性潜力得分、乙酸/丙酸/丁酸合成基因完整度评分。
  * **文献与表型证据**：该株菌或近缘株在公开减脂动物实验/临床 RCT 中的剂量、周期与显著性记录。

### 报告 4：益生菌减脂组合推荐报告 (Probiotic Combination Recommendation Report)
* **内容要素**：
  * **Top 10 推荐组合** 的菌株构成（如：组合 01 由 *L. rhamnosus* Strain X + *B. animalis* Strain Y + *A. muciniphila* Strain Z 组成）。
  * 每个推荐组合的 **功能互补图谱**（如：Strain X 负责产乙酸并降解菊粉，Strain Y 负责水解胆盐，Strain Z 补充黏膜附着，实现功能无缝覆盖）。
  * 针对特定缺失人群的 **个性化匹配度评分** 及预测响应率。
  * **后续验证实验方案建议**：推荐的体外共培养培养基配方、模拟肠道发酵（如 SHIME 系统）的取样节点、小鼠高脂饮食（HFD）模型的干预剂量与主要终点检测建议。

---

## 五、 项目申报与方案书总结表述 (Proposal Executive Summary)

> 本项目拟构建一个基于公开数据库的益生菌减脂组合人工智能预测系统（**ProSlim-Microbiome-AI**）。系统首先从 curatedMetagenomicData、GMrepo、Qiita、SRA/ENA、MGnify 等公开数据库中提取人体粪便微生物组数据、宿主 BMI、年龄、性别、地区、疾病状态、菌群物种丰度、菌属丰度和宏基因组功能通路数据，建立肥胖相关菌群状态预测模型。该模型以 BMI 连续值、肥胖/非肥胖分类和正常体重/超重/肥胖分层为输出，识别与肥胖状态相关的核心菌群、关键功能通路和微生态风险评分（Obesity Microbiome Score, OMS）。
> 
> 在此基础上，系统进一步整合公开益生菌、益生元、合生元和饮食干预研究中的纵向多中心临床数据，提取干预前后菌群变化、益生菌菌株名称、菌株数量、剂量、干预周期、益生元类型以及体重、BMI、腰围、血脂、血糖等临床结局指标，构建益生菌响应人群分型模型。该模型以基线菌群组成、功能通路、宿主基础代谢状态和干预参数为输入，预测不同人群对益生菌干预的响应概率，并识别响应者和非响应者的微生态特征。
> 
> 最后，系统整合候选益生菌菌株的公开基因组数据、功能注释、安全性信息和文献证据，建立候选菌株功能矩阵。通过安全性准入、功能互补评分、目标人群菌群缺失匹配评分、干预响应预测评分和文献证据评分，生成具有减脂潜力的益生菌组合推荐清单。最终输出包括肥胖菌群状态报告、益生菌响应预测报告、候选菌株评分报告 and 益生菌组合推荐报告，为后续体外共培养、模拟肠道发酵、细胞实验、动物实验和人体试验提供可执行的 AI 驱动型筛选依据与闭环实验设计支持。
