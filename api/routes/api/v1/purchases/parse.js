import fastifyXxmlBodyParser from 'fastify-xml-body-parser';
import _ from 'lodash';

const parsePrice = (price) => {
  const [int, fract = ''] = price.split('.');
  return Number([int, fract.padEnd(2, '0')].join(''));
};

const fieldPathsByDocDode = {
  1115131: {
    number: ['СвСчФакт', '@_НомерСчФ'],
    date: ['СвСчФакт', '@_ДатаСчФ'],
    products: ['ТаблСчФакт', 'СведТов'],
    product: {
      number: '@_НомСтр',
      count: '@_КолТов',
      price: '@_ЦенаТов',
    },
  },
  1175010: {
    number: ['СвДокПТПрКроме', 'СвДокПТПр', 'ИдентДок', '@_НомДокПТ'],
    date: ['СвДокПТПрКроме', 'СвДокПТПр', 'ИдентДок', '@_ДатаДокПТ'],
    products: ['СвДокПТПрКроме', 'СодФХЖ2', 'СвТов'],
    product: {
      number: '@_НомТов',
      count: '@_НеттоПередано',
      price: '@_Цена',
    },
  },
};

export default async (app) => {
  app
    .register(fastifyXxmlBodyParser, { validate: true, ignoreAttributes: false })
    .post('/parse', { name: 'parsePurchase' }, async (request, reply) => {
      const purchaseDoc = _.get(request.body, ['Файл', 'Документ']);

      if (!purchaseDoc) {
        reply.code(422);
        return { errors: { document: 'there is no documenet data' } };
      }

      const fieldPaths = fieldPathsByDocDode[purchaseDoc['@_КНД']];

      const products = await Promise.all([_.get(purchaseDoc, fieldPaths.products)]
        .flat()
        .map(async (product) => {
          const name = product['@_НаимТов'];
          const [{ '@_Значен': barcodesAsString } = {}] = product['ИнфПолФХЖ2']
            .filter((field) => field['@_Идентиф'] === 'Для1С_ШтрихкодыНоменклатуры');
          const barcodes = barcodesAsString?.split(',') || [];

          const barcodeEntity = await app.objection.models.barcode.query()
            .select('productId')
            .whereIn('value', barcodes)
            .first();
          const entityWithProductId = barcodeEntity || await app.objection.models.product.query()
            .select('id as productId')
            .findOne({ name });

          return {
            number: +product[fieldPaths.product.number],
            productId: entityWithProductId?.productId || null,
            name,
            count: +product[fieldPaths.product.count],
            price: parsePrice(product[fieldPaths.product.price]),
            barcodes,
          };
        }));

      return {
        supplier: purchaseDoc['@_НаимЭконСубСост'],
        number: _.get(purchaseDoc, fieldPaths.number),
        date: _.get(purchaseDoc, fieldPaths.date).split('.').reverse().join('-'),
        products,
      };
    });
};
