# Which products drove sales, and which credits need review?

**Portfolio case study | Intended audience: retail operations teams**

Analysis of 541,909 historical transaction lines to understand sales performance, customer activity and the data-quality issues that affect reporting.

## The business problem

Retail teams need reliable answers to straightforward questions: Which months generate the most sales? Which products and markets contribute the most value? What do recorded credits mean for performance? Can customer-level reporting be trusted when some identifiers are missing?

This project uses a real public ecommerce dataset to investigate those questions and produce an Excel workbook with documented rules and traceable results. It is a portfolio project, not a commissioned client engagement.

## The dataset

UCI's Online Retail dataset contains 541,909 invoice lines from a UK-based online gift retailer, covering 1 December 2010 to 9 December 2011. Fields include invoice number, stock code, description, quantity, invoice date, unit price, customer ID and country. Amounts are in GBP. Many buyers are wholesalers, which matters when interpreting large orders and customer concentration.

**Source:** Chen, D. (2015). Online Retail. UCI Machine Learning Repository. https://doi.org/10.24432/C5BW33

**Licence:** CC BY 4.0. The original data is preserved; the project adds classifications, aggregates and analysis.

## Approach

### 1. Preserve and profile the source

The original Excel workbook was retained unchanged. Each processed row keeps its original worksheet row number, making it possible to trace a reported issue back to its source.

### 2. Make cleaning decisions explicit

The preparation identified 5,268 exact duplicate repeats and 2,512 additional non-positive-price records. These were separated for review rather than silently deleted. The resulting analysis includes 534,129 transaction lines.

Missing customer IDs were not invented. They remain in overall sales but are excluded from customer segmentation. C-prefixed invoices with negative quantities are classified as recorded credits. No assumption is made that every credit represents a physical return.

### 3. Build an auditable Excel analysis

The workbook contains invoice, monthly, country, product and customer tables, plus a data-quality reconciliation and methodology sheet. Excel formulas calculate net values, average order values, credit ratios, activity segments and dashboard summaries. A country selector updates the monthly results and chart; an editable recency threshold changes the customer activity segments.

Source-level cleaning and aggregation were prepared separately using Python. The workbook is a prepared snapshot with Excel calculations, not a native Power Query refresh or PivotTable model.

### 4. Validate before presenting findings

Included and excluded records reconcile to the original 541,909 lines. Invoice-level net value matches the cleaned transaction totals. Monthly results match independently prepared aggregates. Country selection and customer-threshold changes were tested, and exported formulas, chart references and filter controls were checked.

## Key findings

| Finding | Evidence | Business implication |
|---|---|---|
| November was the strongest complete month | £1.50 million sales; £1.46 million net value | Investigate seasonal stock and staffing needs, with more than one year of data before forecasting. |
| Sales were concentrated in the UK | £9.00 million, approximately 84.6% of sales | UK service reliability deserves priority. Overseas expansion needs separate cost and margin analysis. |
| Customer reporting has a coverage gap | 132,565 included lines lack a customer ID | Improve customer identification and keep identified-customer findings separate from whole-business totals. |
| The final period needs investigation | £205,089 in credits recorded during 1-9 December 2011 | Review large credit transactions before describing a normal returns trend. |
| Stock code 22423 led product net value | REGENCY CAKESTAND 3 TIER: £164,459.49 | A candidate for deeper inventory and margin investigation, rather than an automatic reorder recommendation. |

## A practical output: largest-credit review

The 25 largest credit lines total **£490,827.41**, or **54.9% of all recorded credits**. The accompanying Credit_Review.xlsx includes invoice references, original worksheet row numbers, dates, values, possible earlier sale matches and an individual next step.

The largest credit, **C581484 for £168,469.60**, accounts for **82.1% of December 2011 credit value**. Sale **581483** matches the customer ID, stock code, absolute quantity and unit price, and was recorded **12 minutes earlier**. This is a candidate order reversal to verify against the documents. It is not a confirmed error or accounting link.

Only three of the 25 reviewed credits have an exact earlier sale under the stated matching rule. The remaining records are left for investigation. Separately, **AMAZONFEE credits total £235,281.59** across the dataset, reinforcing why recorded credits should not be described as product returns.

This makes the work usable by an operations or finance reviewer: inspect the highest-value entries first, trace them back to the source and confirm their reasons before changing the reporting or taking action.

## Important limitations

December 2011 is incomplete and should not be compared directly with a full month. Net transaction value is not profit. The data does not contain product costs, acquisition spend, supplier performance or delivery outcomes. Credit values are not linked to purchase cohorts, so the credit-to-sales ratio is not a confirmed return rate. Exact duplicate removal is an assumption because the source has no unique line ID.

## Deliverables

- A 10-sheet Excel workbook with four editable charts and five filterable tables.
- A separate Excel review of the 25 largest credit entries, with source references and next steps.
- The unchanged original Excel dataset.
- Full classified, cleaned and excluded transaction files.
- Documented definitions, reconciliation checks and an interview walkthrough.

## Next steps

With access to a live business, the next step would be to confirm duplicate-handling rules with its finance or operations team, investigate the largest credits, improve customer-ID capture and add cost data before making stock or expansion recommendations.

---

**Download:** Link to the analysis workbook and complete project package when publishing this page.

**Contact:** abdulghaffur.jimoh@gmail.com
