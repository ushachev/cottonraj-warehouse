import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash';

const parsePrice = (price) => {
  const [int, fract = ''] = price.split('.');
  return Number([int, fract.padEnd(2, '0')].join(''));
};

export default (content) => {
  const parser = new XMLParser({ ignoreAttributes: false });
  const purchaseDoc = get(parser.parse(content), ['Файл', 'Документ']);

  if (!purchaseDoc) return null;

  const products = [get(purchaseDoc, ['ТаблСчФакт', 'СведТов'])]
    .flat()
    .map((product) => {
      const [{ '@_Значен': barcodesAsString }] = product['ИнфПолФХЖ2']
        .filter((field) => field['@_Идентиф'] === 'Для1С_ШтрихкодыНоменклатуры');

      return {
        number: +product['@_НомСтр'],
        name: product['@_НаимТов'],
        count: +product['@_КолТов'],
        price: parsePrice(product['@_ЦенаТов']),
        barcodes: barcodesAsString.split(','),
      };
    });

  const purchase = {
    supplier: purchaseDoc['@_НаимЭконСубСост'],
    number: get(purchaseDoc, ['СвСчФакт', '@_НомерСчФ']),
    date: get(purchaseDoc, ['СвСчФакт', '@_ДатаСчФ']).split('.').reverse().join('-'),
    products,
  };

  return purchase;
};
