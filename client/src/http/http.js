import axios from 'axios';
import { Message, Loading } from 'element-ui';
import router from '../router'

let loading;
function startLoading(text) {
  loading = Loading.service({
    lock: true,
    text,
    background: 'rgba(0,0,0,0.7)'
  });
}

function endLoading() {
  loading.close();
}

// 请求拦截
axios.interceptors.request.use(config => {
  startLoading();
  if (localStorage.eleToken) {
    // 设置统一的请求header
    config.headers.Authorization = localStorage.eleToken;
  }
  return config;
}, err => {
  endLoading();
  return Promise.reject(err);
});

axios.interceptors.response.use(response => {
  endLoading();
  return response;
}, err => {
  endLoading();
  const { status, data } = err.response;
  if (status === 401) {
    Message.error("token失效，请重新登录！");
    // 清除token
    localStorage.removeItem("eleToken");
    // 跳转到登录界面
    router.push('/login');
  } else if (typeof data === 'string') {
    Message({
      type: "error",
      message: `${status}：${data}`
    });
  } else {
    Message({
      type: "error",
      message: `${status}：未知的错误`
    });
  }
  return Promise.reject(err);
});
export default axios;