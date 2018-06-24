<template>
  <div id='bar-brush' style="width: 100%; height: 100%;"></div>
</template>

<script>
import * as mailsRequest from '../request/mails'
import echarts from 'echarts'

export default {
  name: 'BarBrush',
  data () {
    return {
      tenantEmails: [
        '373382617@qq.com',
        'zhugino@gmail.com',
        'epam.propertymanagement@gmail.com',
        'yizhou.zhu@outlook.com'
      ]
    }
  },
  methods: {
    async refreshBarBrush () {
      this.tenantSentiments = await mailsRequest.getBarBrushData(
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
    await this.refreshBarBrush()

    var xAxisData = ['CD', 'FP', 'OLE', 'TWI']
    var data1 = []
    var data2 = []
    var data3 = []
    var data4 = []
    var data5 = []

    this.tenantSentiments.map(tsRec => {
      data1.push(tsRec.sentiments[0])
      data2.push(tsRec.sentiments[1])
      data3.push(tsRec.sentiments[2])
      data4.push(tsRec.sentiments[3])
      data5.push(tsRec.sentiments[4])
    })

    var itemStyle = {
      normal: {
      },
      emphasis: {
        barBorderWidth: 1,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: 'rgba(0,0,0,0.5)'
      }
    }

    let option = {
      title: {
        text: 'Tenant Feedback Bar',
        left: 'center',
        top: 5,
        textStyle: {
          color: '#555',
          fontSize: '18px',
          fontWeight: 1000
        }
      },
      backgroundColor: '#fbfbfb',
      toolbox: {
        feature: { }
      },
      tooltip: {},
      xAxis: {
        data: xAxisData,
        name: 'Tenants',
        silent: false,
        axisLine: { onZero: true },
        splitLine: { show: false },
        splitArea: { show: false }
      },
      yAxis: {
        inverse: false,
        splitArea: { show: false },
        max: 10
      },
      grid: {
        top: 50,
        left: 100,
        right: 100
      },
      series: [
        {
          name: '1 Star',
          type: 'bar',
          stack: 'one',
          itemStyle: itemStyle,
          data: data1
        },
        {
          name: '2 Stars',
          type: 'bar',
          stack: 'one',
          itemStyle: itemStyle,
          data: data2
        },
        {
          name: '3 Stars',
          type: 'bar',
          stack: 'one',
          itemStyle: itemStyle,
          data: data3
        },
        {
          name: '4 Stars',
          type: 'bar',
          stack: 'one',
          itemStyle: itemStyle,
          data: data4
        },
        {
          name: '5 Stars',
          type: 'bar',
          stack: 'one',
          itemStyle: itemStyle,
          data: data5
        }
      ]
    }

    this.myChart = echarts.init(document.getElementById('bar-brush'))
    this.myChart.setOption(option)
  }
}
</script>
