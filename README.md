## 本工具用于在原生小程序中使用vue风格开发javascript逻辑

## 安装方法
npm install proxy-mini -S

## 使用方法
```js

const proxyMini = require('proxy-mini')

const config = {
  data: () => ({
    name: 'meili'
  }),
  computed: {
    nice() {
      return this.name === 'meili'
    }
  },
  watch: {
    name: {
      immediate: true,
      deep: true,
      handler: () => {
        console.error('我执行了')
      }
    }
  },
  methods: {
    todo() {
      this.name = 'jack'
    }
  },
  mounted() {
    this.$nextTick(() => {
      console.log('')
    })
  }
}

Page(proxyMini(config))

```