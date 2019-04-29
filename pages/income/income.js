// pages/manage/manage.js
var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      token: wx.getStorageSync('token') //获取本地的token
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 生命周期函数监听页面显示
  onShow: function () {
    var that=this;
    var dataArr = [];  //用于存放临近12个月份的时间
    var newdata = new Date(); //获取当天的时间戳
    y = newdata.getFullYear(),
    m = newdata.getMonth() + 1,
    newdata=y+'.'+(m < 10 ? "0" + m : m);   //时间戳转换为正常时间显示页面用
    newdata2 = y + '-' + (m < 10 ? "0" + m : m);  //时间戳转换为后台所需参数请求数据时用
    var data = new Date();
    var year = data.getFullYear();
    data.setMonth(data.getMonth() + 1, 1)//获取到当前月份,设置月份
    for (var i = 0; i < 12; i++){  //获取从当前月份往前的12个月份
      data.setMonth(data.getMonth() - 1);//每次循环一次 月份值减1
      var m = data.getMonth() + 1;
      m = m < 10 ? "0" + m : m;
      dataArr.push(data.getFullYear() + "." + (m))  //保存到dataArr数组
    }
    that.setData({  //赋值到data
      dataArray:dataArr,
      nowData: newdata,
      newdata2: newdata2
    })

    // 进行所选择月份的订单数和总金额查询
    wx.request({
      url: app.globalData.baseUrl + '/customerorderschedule/order_statistics/'+newdata2,
      method: 'get',
      header: {
        'content-Type': 'application/x-www-form-urlencoded',
        'auth-token': that.data.token
      },
      success: function (res) {
        if (res.data.data.totalAmt % 1 === 0 && res.data.data.totalAmt !== null) { //此处处理总金额的小数点是否显示的问题
          that.setData({
            money: res.data.data.totalAmt + '.00',    //如果为整数而且不为空则总金额后面加'.00'
            coupons: res.data.data
          })
        } else if (res.data.data.totalAmt==null){      //如果为null则直接赋值总金额为0.00  
          that.setData({
            money:0.00,
            coupons: res.data.data
          })
        } else {                                       //否则直接显示总金额
          that.setData({
            money: res.data.data.totalAmt,
            coupons: res.data.data
          })
        }
      }
    });
    // 进行所选择月份的订单列表查询
    wx.request({
      url: app.globalData.baseUrl + '/customerorder/staff_income_count',
      method: 'post',
      data:{
        serviceEndTime:newdata2
      },
      header: {
        'content-Type': 'application/x-www-form-urlencoded',
        'auth-token': that.data.token
      },
      success: function (res){
        console.log(res)
        var timestamp1 = [];
        for (var i = 0; i < res.data.data.length; i++) {  //此处为服务时间循环数据并放到timestamp1数组
          timestamp1.push((res.data.data[i].serviceTime) / 24);  
        }
        that.setData({  //把数据保存到data
          arr3: res.data.data,
          timestamp1: timestamp1
        })
      }
    });
  },
  // 点击进入列表详情
  clickDetails:function(e){
    var orderNo = e.currentTarget.dataset.orderno;  //订单号
    var days = e.currentTarget.dataset.days;    //服务天数
    app.orderNo = orderNo;
    app.days = days;
    wx.navigateTo({
      url: '../income_details/income_details',
    })
  },

  // 进行时间选择
  bindTimeChange:function(e){
    var that=this;
    var dataArray=that.data.dataArray;
    var time = dataArray[e.detail.value]
    that.setData({
      nowData:time,
    })
    var time1 = time.substring(0,4);
    var time2 = time.substring(5,7);
    var time3=time1+'-'+time2;  //把时间拼接成后台所需的参数格式
    console.log(time1,time2,time3)
    //选择完时间后进行查询订单数和总金额
    wx.request({
      url: app.globalData.baseUrl + '/customerorderschedule/order_statistics/' + time3,
      method: 'get',
      header: {
        'content-Type': 'application/x-www-form-urlencoded',
        'auth-token': that.data.token
      },
      success: function (res) {
        console.log(res)
        if (res.data.data.totalAmt % 1 === 0 && res.data.data.totalAmt !== null) { //此处逻辑处理同上
          that.setData({
            money: res.data.data.totalAmt + '.00',
            coupons: res.data.data
          })
        } else if (res.data.data.totalAmt == null) {
          that.setData({
            money: 0.00,
            coupons: res.data.data
          })
        } else {
          that.setData({
            money: res.data.data.totalAmt,
            coupons: res.data.data
          })
        }
      }
    });
    // 同样选择完时间后查询对应月份的订单列表
    wx.request({
      url: app.globalData.baseUrl + '/customerorder/staff_income_count',
      method: 'post',
      data: {
        serviceEndTime: time3
      },
      header: {
        'content-Type': 'application/x-www-form-urlencoded',
        'auth-token': that.data.token
      },
      success: function (res) {    //此处逻辑处理同上
        console.log(res)
        var timestamp1 = [];
        for (var i = 0; i < res.data.data.length; i++) {
          timestamp1.push((res.data.data[i].serviceTime) / 24);
        }
        that.setData({
          arr3: res.data.data,
          timestamp1: timestamp1
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})