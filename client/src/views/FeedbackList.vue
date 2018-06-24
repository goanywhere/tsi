<template>
  <div class='feedback-list'>
    <div class='floorNumber'>
      <span class='showAll' @click="resetActiveTenant">
          {{ floorData && floorData.name }}
        </span>
    </div>
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item v-for="tenant in floorData.tenants" :name="tenant.name" :key="tenant.name + tenant.tenantNumber" v-show="showTenant(tenant)">
        <div slot='title' class='tenant-title'>
          <span :class="['icon', `logo${tenant.tenantNumber}`]"></span>
          <span class='name'>{{tenant.name}}</span>
          <span :class="['face', getFaceIcon(tenant.averageStar || 5)]"></span>
        </div>
        <div :class="['message-info']" v-for="(message, index ) in tenant.messages" :key="message.person + index" @click="readMessage(message)">
          <div class='profile'>
            <span :class="['avatar', `${message.person}`]">
                <i v-if="isRead(message)" class='unread'/>
              </span>
            <span class='name'>
                    <span class='sentby'>
                      {{message.person}}
                    </span>
            <i class='time'>
                      {{formatDate(message.time)}}
                    </i>
            </span>
            <span class='rate'>
                    <RatePanel :scores="message.star"/>
                  </span>
          </div>
          <div class='message'>
            <span class='bubble'>
                    <span class='small'></span>
            <span class='big'></span>
            </span>
            <span class='message-content' v-html="highlight(message.content, message.keywords, message)"></span>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
  import RatePanel from './RatePanel'
  const moment = require('moment')
  const fontColorsCls = [
    'highlight-blue',
    'highlight-green',
    'highlight-yellow',
    'highlight-orange',
    'highlight-red'
  ]
  export default {
    name: 'FeedbackList',
    components: {
      RatePanel
    },
    props: {
      floorData: {
        type: Object,
        default: () => {},
        required: true
      },
      activeTenant: {
        type: Array,
        default: () => []
      },
      readOneMessage: {
        type: Function,
        default: () => {}
      }
    },
    data() {
      return {
        activeNames: []
      }
    },
    methods: {
      changeRate(val, index) {
        this.messages.splice(index, 1, val)
      },
      handleChange(val) {},
      formatDate(date) {
        return moment(date).format('DD/MM/YY')
      },
      getFaceIcon(scores) {
        let clsName = 'laugh-face'
        if (scores < 2) {
          clsName = 'angry-face'
        } else if (scores < 3) {
          clsName = 'sad-face'
        } else if (scores < 4) {
          clsName = 'smile-face'
        } else if (scores < 5) {
          clsName = 'laugh-face'
        }
        return clsName
      },
      showTenant(tenant) {
        return this.activeNames.includes(tenant.name) || this.activeNames.length === 0
      },
      resetActiveTenant() {
        this.activeNames = []
      },
      readMessage(message) {
        const readKeys = JSON.parse(localStorage.getItem('ALREADY_READ_KEY'))
        if (!readKeys.includes(message.id)) {
          readKeys.push(message.id)
          localStorage.setItem('ALREADY_READ_KEY', JSON.stringify(readKeys))
          this.readOneMessage()
          this.$forceUpdate()
        }
      },
      highlight(words, keys, message) {
        let newstr = words
        keys.map(key => {
          const reg = new RegExp('(' + key.name + ')', 'g')
          newstr = newstr.replace(reg, `<span class=${fontColorsCls[key.name.length % 5]}>$1</span>`)
        })
        return newstr
      },
      isRead(message) {
        const readKeys = JSON.parse(localStorage.getItem('ALREADY_READ_KEY'))
        return !readKeys.includes(message.id)
      }
    },
    watch: {
      activeTenant() {
        this.activeNames = this.activeTenant
      }
    }
  }
</script>

<style lang='scss'>
  @import '../styles/logos.scss';
  .feedback-list {
    margin-bottom: 20px;
    $logo-size: 45px;
    $face-size: 60px;
    .highlight-font {
      padding: 0 5px;
      border-radius: 5px
    }
    .highlight-blue {
      @extend .highlight-font;
      background: #D8E2F3;
    }
    .highlight-green {
      @extend .highlight-font;
      background: #E7EFD1;
    }
    .highlight-yellow {
      @extend .highlight-font;
      background: #FDF3C8;
    }
    .highlight-orange {
      @extend .highlight-font;
      background: #FFE9D3;
    }
    .highlight-red {
      @extend .highlight-font;
      background: #ED880B;
    }
    .angry-face {
      background: url('../assets/emotion/1.svg') center center no-repeat
    }
    .sad-face {
      background: url('../assets/emotion/2.svg') center center no-repeat
    }
    .smile-face {
      background: url('../assets/emotion/3.svg') center center no-repeat
    }
    .laugh-face {
      background: url('../assets/emotion/4.svg') center center no-repeat
    }
    .floorNumber {
      text-align: left;
      span.showAll {
        padding: 0 10px;
        text-align: center;
        background: #1D7695;
        width: 120px;
        height: 40px;
        line-height: 40px;
        color: white;
        font-size: 25px;
        box-sizing: border-box;
        font-weight: bold;
        display: inline-block;
        cursor: pointer;
      }
    }
    .tenant-title {
      display: flex;
      align-items: center;
      span {
        display: inline-block;
      }
      .icon {
        height: 45px;
        width: 45px;
      }
      .name {
        flex: 1;
        font-size: 25px;
        font-weight: bold;
        text-align: left;
        padding-left: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      .face {
        height: $face-size;
        width: $face-size;
        background-color: #DFF1D8;
        background-size: contain;
      }
    }
    .el-collapse-item__header {
      height: 60px;
      line-height: 60px;
      background: #DFF2F4;
      i::before {
        display: none;
      }
    }
    .el-collapse-item__content {
      background: #F4FEFE;
    }
    .unread {
      height: 15px;
      width: 15px;
      border-radius: 50%;
      display: inline-block;
      background: red;
      position: absolute;
      right: 0;
    }
    .message-info {
      cursor: pointer;
      .message {
        display: flex;
        .bubble {
          height: 60px;
          width: 60px;
          display: inline-block;
          position: relative;
          .circle {
            position: absolute;
            border-radius: 50%;
            background: #DFF2F4;
            display: inline-block;
          }
          .small {
            @extend .circle;
            height: 10px;
            width: 10px;
          }
          .big {
            @extend .circle;
            height: 20px;
            width: 20px;
            margin-top: 11px;
            margin-left: 5px;
          }
        }
        .message-content {
          padding: 10px;
          margin-top: 15px;
          border-radius: 7px;
          display: inline-block;
          flex: 1;
          background: #DFF2F4;
          text-align: left;
          font-size: 25px;
          font-weight: bold;
        }
      }
    }
    .message-info {
      $message-height: 50px;
      $avatar-size: 40px;
      padding-right: 10px;
      margin-top: 15px;
      .profile {
        height: 70px;
        display: flex;
        line-height: $message-height;
        padding: 5px 0 0 20px;
        align-items: center;
      }
      .avatar,
      .name,
      .rate {
        display: inline-block;
      }
      .avatar {
        position: relative;
        height: $avatar-size;
        width: $avatar-size;
        top: -5px;
        right: 5px;
        height: 55px;
        width: 55px;
        background-size: cover;
      }
      .name {
        flex: 1;
        text-align: left;
        font-size: 16px;
        font-weight: bold;
        margin-left: 15px;
        .sentby,
        .time {
          height: 30px;
          line-height: 30px;
          display: block;
        }
        .sentby {
          font-size: 25px;
        }
        .time {
          font-weight: normal;
          font-size: 12px;
        }
      }
      .rate {
        width: 120px;
      }
    }
  }
</style>
