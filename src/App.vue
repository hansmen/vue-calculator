<template>
  <div id="app">
    <div class="w-full flex flex-col justify-center items-center">
      <div class="container w-1/2 flex flex-col items-center">
        <h1 class="text-2xl font-bold w-full text-center my-8">Ипотечный калькулятор</h1>
        <multiselect class="w-full my-4" :allow-empty="false" v-model="purposeModel" :show-labels="false" track-by="name" label="name" placeholder="Выберите цель кредита" :options="response.purpose" :searchable="false">
          <template slot="singleLabel" slot-scope="{ option }"><strong>{{ option.name }}</strong> под <strong>  {{ option.value }}</strong>%</template>
        </multiselect>
        <FormulateInput
            class="w-full text-xl font-bold my-2"
            v-model="salaryCard"
            type="checkbox"
            label="Есть зарплатная карта"
        />
        <custom-slider
        class="w-full"
        :min="response.houseCosts.min"
        :max="response.houseCosts.max"
        :step="response.houseCosts.step"
        v-model="houseCost"
        hideLabel
        />
        <p class="text-xl w-full">Стоимость жилья: {{houseCost}} ₽</p>
        <custom-slider
            class="w-full mt-4"
            :min="response.initialsFee.min"
            :max="response.initialsFee.max"
            :step="response.initialsFee.step"
            v-model="initialFee"
            hideLabel
        />
        <p v-if="error" class="text-sm w-full text-red-500">Сумма жилья не может превышать первоначальный взнос</p>
        <p class="text-xl w-full">Первоначальный взнос: {{initialFee}} ₽</p>
        <custom-slider
            class="w-full mt-4"
            :min="response.creditsTerm.min"
            :max="response.creditsTerm.max"
            :step="response.creditsTerm.step"
            v-model="creditTerm"
            hideLabel
        />
        <p class="text-xl w-full">Срок кредита в годах: {{creditTerm}}</p>
        <FormulateInput
            class="mt-10 bg-white"
            @click="this.calculate"
            type="button"
            name="График платежей"
        />
        <vs-dialog scroll overflow-hidden auto-width class="modal" v-model="show">
          <vs-table>
            <template #thead>
              <vs-tr>
                <vs-th>Год</vs-th>
                <vs-th class='text-center'>Сума платежа</vs-th>
                <vs-th class='text-center'>Погашение процентов</vs-th>
                <vs-th class='text-center'>Погашение основного долга</vs-th>
                <vs-th class='text-center'>Остаток долга</vs-th>
              </vs-tr>
            </template>
            <template #tbody>
              <vs-tr
                  :key="i"
                  v-for="(tr, i) in items"
                  :data="tr"
              >
                <vs-td>
                  {{ tr.year }}
                </vs-td>
                <vs-td>
                  {{ tr.yearAmount }}
                </vs-td>
                <vs-td>
                  {{ tr.interestPaid }}
                </vs-td>
                <vs-td>
                  {{ tr.capitalRepayment }}
                </vs-td>
                <vs-td>
                  {{ tr.amount }}
                </vs-td>
              </vs-tr>
            </template>
          </vs-table>
        </vs-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import CustomSlider from 'vue-custom-range-slider'
import { Data } from '@/data'
// import { required } from 'vuelidate/lib/validators'

export default {
  name: 'App',
  components: {CustomSlider},
  validations() {
    return {
        response:  {
        },
      }
    },
  data () {
    return {
      houseCost:'2000000',
      initialFee:'10000',
      creditTerm:'4',
      totalPayment: '',
      totalDebt: '',
      monthlyPayment: 0,
      totalInterest: 0,
      salaryCard: false,
      purposeModel: { name: 'Готовое жилье', value: 7.7},
      response:  {
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
      },
      show: false,
      error:false,
      items: [
        {
          year: 1,
          amount: 100000,
          yearAmount: 10000,
          capitalRepayment: 0,
          interestPaid: 0
        }
      ],
    }
  },
  async mounted() {
    const response = await Data.getInitialValues()
    this.response = response.data
  },
  methods: {
    calculate()  {
      this.show = true
      this.getYearlyDebt()
    },
    getYearlyDebt() {
      let term = this.creditTerm
      let debt = this.houseCost - this.initialFee
      let updatedDebt = this.houseCost - this.initialFee
      let rate = this.purposeModel.value

      let topOfMortgageEquation = debt * rate
      let bottomOfMortgageEquation = 100 * (Math.pow(1 + (rate / 100), term) - 1)
      let equationAnswer = topOfMortgageEquation / bottomOfMortgageEquation

      this.items.length = 0

      // this.items.push({year: 0, amount: debt, interestPaid:0, capitalRepayment: 0,yearAmount: Math.round(updatedDebt / term)})
      debt = Math.ceil(debt - (updatedDebt / term))
      this.items.push({year: 1, amount: Math.ceil(debt), interestPaid: Math.round(equationAnswer * (term / 100)), capitalRepayment: Math.round((updatedDebt / term) - equationAnswer * (term / 100)), yearAmount: Math.round(updatedDebt / term)})

      let adjustedRate = 1 + (rate / 100)
      let result = 0

      for (let i = 2; i < term; i++) {
        result = Math.pow(adjustedRate, i - 1) * equationAnswer
        debt = debt - (updatedDebt / term)
        this.items.push({year: i, amount: Math.ceil(debt), interestPaid: Math.round(result * (term / 100)), capitalRepayment: Math.round((updatedDebt / term) - result * (term / 100)), yearAmount: Math.round(updatedDebt / term)})
      }

      this.items.push({year: term, amount: 0, interestPaid:Math.round((updatedDebt / term) * (term / 100)), capitalRepayment: Math.round((updatedDebt / term) - ((updatedDebt / term) * (term / 100))), yearAmount: Math.round(updatedDebt / term)})
    },
  }
}
</script>

<style lang="scss">
</style>
