# SI 649 Final Porject: Team 2 
## USA OBESITY STORY

* 📈 [Live Link](https://supervanya.github.io/d3-obesity-usa/)❤️
* 🎨 [Interractive Mockup](https://www.figma.com/proto/NhHZBKuiAZvEjUI94xQaJY/SI-649-Final-Project?node-id=1%3A26&scaling=min-zoom) 
* 📄 [Report](https://docs.google.com/document/d/1Z7ODrlVF2wLYBtoT0PQU5oQUB7z7rvtoapWrp4CCgao/edit?usp=sharing)
* 🖥️ [Data Source (CDC - BRFSS)](https://www.cdc.gov/brfss/annual_data/annual_data.htm)


### Work in Progress still
- [ ] Make the line chart module use the D3 v5 instead of v3
- [ ] Use Bhawna's mockup to adjust styling
- [ ] Update the readability of the code for the scatterplot
- [ ] Make the Y-Axis update based on the year when in scatterplot mode
 

### Goal: 
Find how each state is doing and what could be some reasons.

40% : Obesity among American adults in 2019.  
2.8 million deaths worldwide due to obesity in 2008. 
$242 billion spent on obesity health care in the US in 2012.  

### Domain Tasks:
How does adult obesity* change over time for each state in the U.S.?
How is obesity correlated with demographics and other factors ( median income, economic status etc.) 

### Design Rationale:
In our visualization we tried to create structure similar to Martini glass style. Starting with the author driven animation showwing the animation on Obesity rise. Then leading the reader to correlation plot to find how obesity is related to smoking, poverty, income, lack of healthcare, age group. Obese poplulation is defined as one with BMI > 30.

<details>
 <summary>Data Encodings</summary>

#### 1. Dorling Cartogram 
This animation shows change in the obesity rate over the years 
* Mark type: circle (Dorling Cartogram)
* Interaction : time slider

Encoding Specification: 
* x-axis: Latitude : Quantitative 
* y-axis: Longitude: Quantitative
* Size: Obesity rate
* Tooltip: text annotation of State Abbreviation and Prevalence

 
#### 2.Scatter Plot for Correlation
Shows how obesity is related with Age group, Smoking, Lack of healthacre, Income and Poverty

Encoding 
* X axis: Age group/ Smoking/ Lack Healthcare/ poverty/ Household income
* Y axis: Obesity rate
Interaction: click on deisplays the text that explains the correlation.

##### Obesity Correlation with:
* Age group
* Smoking
* Lack Healthcare
* Poverty
* Household income

#### 3.Time series interactive charts (from Dorling Chart Interaction)

**Selection: Line chart for breakout categories**
* X axis: Year: Quantitative
* Y axis ->  Obesity rate: Quantitative
* Color -> Breakout categories
* Selection: radio button


##### Breakout categories are:
**Age Group:** 
* 18-24 yr
* 25 -34 yr
* 35-44 yr
* 45-54 yr
* 55-64 yr
* 65 and above

**Race/Ethnicity:**
* American Indian,
* Asian, Black, Hispanic
* Multiracial
* Other
* White

**Household Income:** 
* College graduate
* H.S or G.E.D
* Less than H.S
* Some post H.S

**Education attained:**
* Less than $15K
* $15K-$24K 
* $25K-$34K
* $35K-$49K
* $50K and more

**Gender:**
* Female
* Male

</details>

## Conclusion:
We see that Obesity is positivity corelated to poverty and negatively correlated to income. Wealther states have less obesity rate. Age group 35-40 years have most instances of obesity. Smoking is negatively corelated with obesity. Also the states with less healthcare coverage tends to have more obesity. Through these interesting insights we come to know that obesity is not just an issue of epidemic. Rise in obesity is also indicative of its deeper roots in macroeconomic factors like poverty, household income, education and healthcare coverage. If we want to tackle the obesity epidemic in US we would need to take an integrated approach by addressing the macroeconomic factors realted to it.


### source:
[10 facts on Obesity, World Health Organization](https://www.who.int/features/factfiles/obesity/en/)
