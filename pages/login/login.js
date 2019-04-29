const PublicFun = require('../../utils/PublicFun.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    text: '获取验证码', //按钮文字
    currentTime: 60, //倒计时
    disabled: false, //按钮是否禁用
    color: '#fff',
    phone: '', //获取到的手机栏中的值
    code: '',
  },
  //获取手机栏input中的值
  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  // 获取验证码
  codeInput: function (e) {
    this.setData({
      code: e.detail.value
    })
  },
  bindButtonTap: function () {
    var that = this;
    that.setData({
      disabled: true, //只要点击了按钮就让按钮禁用 （避免正常情况下多次触发定时器事件）
    })

    var phone = that.data.phone;
    var currentTime = that.data.currentTime //把手机号跟倒计时值变例成js值

    var errMsg = null; //warn为当手机号为空或格式不正确时提示用户的文字，默认为空
    if (phone == '') {
      errMsg = '手机号不能为空！';
    } else if (phone.trim().length != 11 || !/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(phone)) {
      errMsg = '手机号格式有误！';
    } else {
      //当手机号正确的时候提示用户短信验证码已经发送
      wx.request({
        url: app.globalData.baseUrl + '/sms/send_verify_code_nurse/' + phone,
        method: 'get',
        header: {
          'content-Type': 'application/x-www-form-urlencoded',
        },
        success: function (res) {
          console.log(res)
          if (res.data.code == 200) {
            setTimeout(function () {
              wx.showToast({
                title: '短信验证码已发送',
                icon: 'none',
                duration: 2000
              });
            }, 500);
          } else if (res.data.code == 500) {
            wx.showToast({
              title: '短信验证码发送失败',
              icon: 'none',
              duration: 2000
            });
          }
        }
      });
      //设置一分钟的倒计时
      var interval = setInterval(function () {
        currentTime--; //每执行一次让倒计时秒数减一
        that.setData({
          text: currentTime + 's后重新获取', //按钮文字变成倒计时对应秒数

        })
        //如果当秒数小于等于0时 停止计时器 且按钮文字变成重新发送 且按钮变成可用状态 倒计时的秒数也要恢复成默认秒数 即让获取验证码的按钮恢复到初始化状态只改变按钮文字
        if (currentTime <= 0) {
          clearInterval(interval)
          that.setData({
            text: '重新获取',
            currentTime: 61,
            disabled: false,
          })
        }
      }, 1000);

    };
    //判断 当提示错误信息文字不为空 即手机号输入有问题时提示用户错误信息 并且提示完之后一定要让按钮为可用状态 因为点击按钮时设置了只要点击了按钮就让按钮禁用的情况
    if (errMsg) {
      PublicFun._showToast(errMsg);
      that.setData({
        disabled: false,
      })
      return;
    };
  },
  formSubmit:function(e){
    var that=this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    wx.getUserInfo({
      lang: "zh_CN",
      success: res => {
        var region = res.userInfo.province + res.userInfo.city
        var openId = wx.getStorageSync('openId')
        wx.setStorageSync('userInfo', res.userInfo)
        wx.request({
                url: app.globalData.baseUrl + '/auth/apply_certification',
                method: 'POST',
                data: {
                  nickname: res.userInfo.nickName,
                  avatar: res.userInfo.avatarUrl,
                  sex: res.userInfo.gender,
                  region:region,
                  phone: e.detail.value.phone,
                  verifyCode: e.detail.value.verifyCode,
                  idNo: e.detail.value.idNo,
                  openId: openId
                }, 
                header: {
                  'content-type': 'application/x-www-form-urlencoded',
                },
                success: function (res){
                  console.log(res)
                  if(res.data.code==200){
                    wx.showModal({
                      content: '您的申请已提交，请耐心等待',
                      showCancel:false,
                      confirmColor:'#5489FD',
                      confirmText:'确定'
                    })
                  }else{
                    wx.showToast({
                      title: res.data.errorMsg,
                      icon: 'none',
                      duration: 1000,
                    });
                  }
                },
              })
          }
      })
    },
  onLoad: function (options) {
    console.log(app.globalData); 
  },

  
  onReady: function () {
    
  },

  
  onShow: function () {
    
  },

  
  onHide: function () {
    
  },

  
  onUnload: function () {
    
  },

  
  onPullDownRefresh: function () {
    
  },

  onReachBottom: function () {
    
  },

 
  onShareAppMessage: function () {
    
  }
})