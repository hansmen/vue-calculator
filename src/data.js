const appData = {
    houseCosts: {
        min: '2000000', max: '20000000', step: '25000'
      },
      initialsFee: { min: '10000', max: '1500000', step: '10000' },
      creditsTerm: { min: '1', max: '20' },
      purpose: [
        { name: 'Готовое жилье', value: 7.7},
        { name: 'Военная ипотека', value: 7.9},
        { name: 'Свой дом под ключ', value: 7.9},
        { name: 'Новострой', value: 1.3}
      ],
  }


  export class Data {
    static getInitialValues() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            'status': 'success',
            'data': appData
          })
          reject(new Error('Registration error'))
        }, 200)
      })
    }
  }