
<template>
  <div class='rate-panel'>
    <el-rate v-model="scores" disabled :colors="['#FF9900', '#FF9900', '#FF9900']"></el-rate>
  </div>
</template>
<script>
export default {
  name: 'RatePanel',
  props: {
    scores: {
      type: Number,
      default: 5
    }
  }
}
</script>

<style>

</style>

<style>

</style>
