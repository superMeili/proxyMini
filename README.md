### 本工具用于在原生小程序中使用vue风格开发javascript逻辑
- 原生开发支持，开箱即用，无需打包工具

### 安装方法
npm install proxy-mini -save

### 使用方法
1. 原生小程序开启npm支持模式
2. 在页面js中（pages）require引用proxy-mini包
```js
const proxyMini = require('proxy-mini')
```
3. 通过调用proxyMini方法生成小程序页面配置对象
```js
Page(proxyMini({
  data: {},
  method: {},
  mounted: {}
}))
```

### 说明
1. data, methods, computed, watch等配置项与vue2完全一致
2. 生命周期钩子基于原生小程序页面生命周期封装，对应关系如下表
3. 支持$watch,$nextTick API
4. 支持小程序全部配置项
3. 更新方式：
- 对象 使用路径赋值 如： this.obj.x = 1
- 数组 使用路径赋值 如：this.arr[0] = 1 ， 数组支持 push, pop, unshift, shift, splice, sort, reverse 等更新方法， 如： this.arr.push(1)

|  proxy-mini   | 小程序  | 说明
|  ----  | ----  | ----  |
| beforeCreate  | 无 | vue实例初始化开始
| created  | 无 | vue实例初始化完成
| beforeMount  | onLoad | 页面加载
| activated  | onShow | 页面开始显示
| mounted  | onReady | 页面加载完成
| deactivated  | onHide | 切入后台
| destroyed  | onUnload | 页面卸载

*也可以直接使用小程序生命周期钩子, 会覆盖对应的vue生命周期钩子（如果同时声明）*

### 示例
```js

const proxyMini = require('proxy-mini')

const config = proxyMini({
  data: function () ( // data 支持对象或函数类型
    return { 
      name: 'meili',
      info: {
        time: '2021-12-10'
      },
      like: 'music'
    }
  ),
  computed: {
    nickname() {
      return this.name === 'meili' ? 'superMeili' : 'jack'
    },
    work: {
      get() {
        return this.nickname === 'superMeili' ? 'code man' : 'singer'
      },
      set() {
        alert('can not change work')
      }
    },
  },
  watch: {
    like() {
      alert('like change!')
    },
    name: {
      immediate: true,
      handler: () => {
        alert('name change!')
      }
    },
    info: {
      deep: true,
      immediate: true,
      handler: () => {
        alert('info change!')
      }
    },
    ['info.time']() {
      alert('time change!')
    }
  },
  methods: {
    handler() {
      this.name = 'jack'
    }
  },
  beforeCreate() {}, 
  created() {}, 
  beforeMount() {}, 
  mounted() {}, 
  activated() {},
  deactivated() {},
  destroyed() {},
}) 

Page(config)

```