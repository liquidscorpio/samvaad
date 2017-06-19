import numpy as np
import pandas as pd

if __name__ == '__main__':
    df = pd.read_csv('API_8_DS2_en_csv_v2.csv')
    rem_columns = list([str(x) for x in range(1960, 2014)]) + ['Unnamed: 61', '2015', '2016']
    key_indicators = (
        df[df['Indicator Code'].isin(['SH.XPD.OOPC.TO.ZS', 'SH.XPD.PCAP.PP.KD'])]
            .drop(rem_columns, axis=1)
            .dropna(how='all')
    )

    raw_pvt = key_indicators.pivot(index='Country Name', columns='Indicator Name', values='2014').dropna()
    computed_col = 'Per Capita Amount at Risk PPP (constant 2011 international $)'
    raw_pvt[computed_col] = raw_pvt['Health expenditure per capita, PPP (constant 2011 international $)'] * raw_pvt['Out-of-pocket health expenditure (% of total expenditure on health)'] / 100
    pvt = raw_pvt.sort_values(computed_col, ascending=False).rename_axis(None, axis=1).reset_index()
    pvt.rename(columns={
        'Health expenditure per capita, PPP (constant 2011 international $)': 'Expense Per Capita',
        'Out-of-pocket health expenditure (% of total expenditure on health)': 'Out of Pocket (%)',
        'Per Capita Amount at Risk PPP (constant 2011 international $)': 'Amount at Risk'
    }, inplace=True)

    highest_value = pvt.head(1)['Amount at Risk'][0]
    pvt['Luminosity'] = 100 - (pvt['Amount at Risk'] * 57.3 / highest_value)
    json_data = pvt.to_json(orient='records')
    with open('./amount_at_risk.json', 'w') as out:
        out.write(json_data)
        out.flush()