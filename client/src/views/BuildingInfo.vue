<template>
  <div class='building-info'>
    <p @click="showAll">{{ this.choosedIndex !== -1 ? 'ShowALL' : 'ALL'}}</p>
    <div class='imgs' @mouseout="showBright">
      <transition-group name="fade" tag='div'>
        <div v-for="(floor, index) in floorsData"
          v-show="choosedIndex === -1 || choosedIndex === parseInt(floor.floorNumber)" 
          :class="[`floor${parseInt(floor.floorNumber)}`, imgAnimationCls(parseInt(floor.floorNumber)), {'mark' : !brightAll && brightNumber !== floor.floorNumber}]"
          :style="getStyle(index, floor)"
          :key="index + 'floors' + floor.name"
          @mouseover="mouseover(floor.floorNumber)"
          @click="chooseImg(floor.floorNumber)"
          >
          <div v-show="choosedIndex !== -1"
            v-for="tenant in floor.tenants"
            :class="['logo' + tenant.tenantNumber, 'inside-logo', {'logo-shark': hasUnreadMessage(tenant)}]" :key="tenant.name + tenant.tenantNumber"
            @click.stop="chooseTenant(tenant)"
          />
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import eventBus from '../eventBus'

export default {
  name: 'BuildingInfo',
  props: {
    activeFloorIndex: {
      type: Function,
      default: () => {}
    },
    floorsData: {
      type: Array,
      required: true
    },
    getActiveTenant: {
      type: Function,
      default: () => {}
    },
    timestamp: {
      type: [Date, String],
      default: ''
    }
  },
  data () {
    return ({
      choosedIndex: -1,
      brightNumber: '',
      brightAll: true
    })
  },
  watch: {
    timestamp () {
      this.$forceUpdate()
    }
  },
  methods: {
    getStyle (index, floor) {
      const calcIndex = index
      return {
        zIndex: parseInt(floor.floorNumber),
        marginTop: calcIndex * 150 + 'px'
      }
    },
    chooseImg (floorNumber) {
      this.choosedIndex = parseInt(floorNumber)
      this.activeFloorIndex(this.choosedIndex)
    },
    imgAnimationCls (floorNumber) {
      let cls = ''
      if (this.choosedIndex !== -1) {
        cls = this.choosedIndex === parseInt(floorNumber) ? 'choosed' : this.choosedIndex < parseInt(floorNumber) ? 'fadeOutDown' : 'fadeOutUp'
      }
      return cls
    },
    showAll () {
      this.choosedIndex = -1
      this.activeFloorIndex(this.choosedIndex)
    },
    chooseTenant (tenantInfo) {
      this.getActiveTenant(tenantInfo)
    },
    hasUnreadMessage (tenant) {
      let unread = false
      const readKeys = JSON.parse(localStorage.getItem('ALREADY_READ_KEY'))

      tenant.messages.map(message => {
        if (!readKeys.includes(message.id)) {
          unread = true
        }
      })
      return unread
    },
    mouseover(number) {
      this.brightAll = false
      this.brightNumber = number
    },
    showBright() {
      this.brightAll = true
    }
  }
}
</script>

<style lang="scss">
  .building-info {
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    p:hover {
      color: blue;
      cursor: pointer;
    }
    p {
      width: 100%;
      text-align: left;
      font-size: 20px;
    }
    .mark {
      opacity: 0.3;
    }
    .imgs {
      height: 100%;
      position: relative;
      width: 100%;
      .floor {
        left: 0;
        position: absolute;
        height: 300px;
        width: 100%;
        transition: all 1s;
      }
      .floor1 {
        @extend .floor;
        background: url('../assets/F1.svg') no-repeat no-repeat center;
      }
      .floor2 {
        @extend .floor;
        background: url('../assets/F2.svg') no-repeat no-repeat center;
      }
      .floor3 {
        @extend .floor;
        background: url('../assets/F3.svg') no-repeat no-repeat center;
      }
      .floor:hover {
        z-index: 100 !important;
        transform: scale(1.1);
        cursor: pointer;
      }
      .choosed {
        height: 500px;
        margin-top: 50px !important;
        display: flex;
        align-items: center;
        &:hover {
          transform: scale(1.0) !important;
        }
      }
      .fade-enter-active,
      .fade-leave-active {
        transition: all 1s;
      }
      .fade-enter,
      .fade-leave-to {
        opacity: 0;
        transform: translateX(30px);
      }
    }
  }
</style>
