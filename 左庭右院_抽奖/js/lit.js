/**
 * 基于JQuery的现代化开发
 * @author 高金斌
 */
const lit = async (cb)=> {
  /** 获取 URL 参数 */
  $.getQueryString = (name)=> {
    let reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)")
    let r = window.location.search.substr(1).match(reg)
    return r ? decodeURI(r[2]): null
  }
  /** 创建响应式参数 */
  $.reactive = (obj, name = 'lit')=> {
    way.set(name, obj)
    return new Proxy(obj, {
      get: (target, prop)=> {
        return target[prop]
      },
      set: (target, prop, value)=> {
        target[prop] = value
        way.set(name, target)
      }
    })
  }
  /** JQuery准备就绪 */
  $(()=> {
    /** 循环加载 */
    $('[data-lit]').each(function() {
      const url = $(this).data('lit')
      const delay = $(this).data('delay')
      setTimeout(() => {
        $(this).load(`${url}?v=${new Date().getTime()}`)
      }, delay ? delay * 1000: 50)
    })
    /** 回调函数 */
    cb()
  })
}
