<template>
  <div id='line-stack' style="width: 100%; height: 100%;"></div>
</template>

<script>
import * as mailsRequest from '../request/mails'
import echarts from 'echarts'

export default {
  name: 'LineStack',
  data () {
    return {
      tenantEmails: [
        '373382617@qq.com',
        'zhugino@gmail.com',
        'jim.zhan@me.com',
        'jim@funbox.me'
      ],
      startTime: new Date(2018, 5, 22),
      endTime: new Date(),
      interval: 10
    }
  },
  methods: {
    async refreshLineStack () {
      this.tenantFramedEmails = await mailsRequest.getLineStackData(
        this.tenantEmails,
        this.startTime,
        this.endTime,
        this.interval
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
          backgroundColor: '#f8f8f8',
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
    await this.refreshLineStack()

    const series = this.tenantFramedEmails.map(rec => {
      return {
        name: rec.name,
        type: 'line',
        stack: '总量',
        data: rec.framedEmails.map(mails => mails.result)
      }
    })
    let option = {
      backgroundColor: '#fbfbfb',
      title: {
        text: 'Feedback Counts',
        left: 'center',
        top: 5,
        textStyle: {
          color: '#555',
          fontSize: '18px',
          fontWeight: 1000
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        top: '20%',
        bottom: '15%',
        containLabel: true
      },
      toolbox: {
        feature: { }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      },
      yAxis: {
        type: 'value'
      },
      series
    }

    this.myChart = echarts.init(document.getElementById('line-stack'))
    this.myChart.setOption(option)
  }
}
</script>
