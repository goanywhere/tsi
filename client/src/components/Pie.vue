<template>
  <div id='pie' style="width: 100%; height: 100%;"></div>
</template>

<script>
import * as mailsRequest from '../request/mails'
import echarts from 'echarts'

export default {
  name: 'Pie',
  data () {
    return {
      tenantEmails: [
        '373382617@qq.com',
        'zhugino@gmail.com',
        'epam.propertymanagement@gmail.com'
      ]
    }
  },
  methods: {
    async refreshPie () {
      this.tenantKeywords = await mailsRequest.getPieData(
        this.tenantEmails
      )
    },
    renderBrushed (params) {
      var brushed = []
      var brushComponent = params.batch[0]

      for (var sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
        var rawIndices = brushComponent.selected[sIdx].dataIndex
        brushed.push('[Series ' + sIdx + '] ' + rawIndices.join(', '))
      }

      this.myChart.setOption({
        title: {
          backgroundColor: '#333',
          text: 'SELECTED DATA INDICES: \n' + brushed.join('\n'),
          bottom: 0,
          right: 0,
          width: 100,
          textStyle: {
            fontSize: 12,
            color: '#fff'
          }
        }
      })
    }
  },
  async mounted () {
    await this.refreshPie()

    let option = {
      backgroundColor: '#fbfbfb',

      title: {
        text: 'Tenant Satisfaction Pie',
        left: 'center',
        top: 5,
        textStyle: {
          color: '#555',
          fontSize: '18px',
          fontWeight: 1000
        }
      },

      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },

      visualMap: {
        show: false,
        min: 3,
        max: 25,
        inRange: {
          colorLightness: [0, 1.8]
        }
      },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: [
            {
              value: (this.tenantKeywords[0].count + 1),
              name: '5 Star',
              tooltip: this.tenantKeywords[0].keysets.slice(0, 3).join(', ') || 'No Data Found'
            },
            {
              value: (this.tenantKeywords[1].count + 1),
              name: '4 Star',
              tooltip: this.tenantKeywords[1].keysets.slice(0, 3).join(', ') || 'No Data Found'
            },
            {
              value: (this.tenantKeywords[2].count + 1),
              name: '3 Star',
              tooltip: this.tenantKeywords[2].keysets.slice(0, 3).join(', ') || 'No Data Found'
            },
            {
              value: (this.tenantKeywords[3].count + 1),
              name: '2 Star',
              tooltip: this.tenantKeywords[3].keysets.slice(0, 3).join(', ') || 'No Data Found'
            },
            {
              value: (this.tenantKeywords[4].count + 1),
              name: '1 Star',
              tooltip: this.tenantKeywords[4].keysets.slice(0, 3).join(', ') || 'No Data Found'
            }
          ].sort(function (a, b) { return a.value - b.value }),
          roseType: 'radius',
          label: {
            normal: {
              textStyle: {
                color: 'rgba(100, 100, 100, 0.8)',
                fontSize: '12px',
                fontWeight: 1000
              }
            }
          },
          labelLine: {
            normal: {
              lineStyle: {
                color: 'rgba(100, 100, 100, 0.8)',
                fontSize: '12px',
                fontWeight: 1000
              },
              smooth: 0.2,
              length: 10,
              length2: 20
            }
          },
          itemStyle: {
            normal: {
              color: '#DFF1D8'
            }
          },

          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx) {
            return Math.random() * 200
          }
        }
      ]
    }

    this.myChart = echarts.init(document.getElementById('pie'))
    this.myChart.on('brushSelected', this.renderBrushed)
    this.myChart.setOption(option)
  }
}
</script>
