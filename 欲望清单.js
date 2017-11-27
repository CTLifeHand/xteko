const searchView = {
  type: 'view',
  props: {
    id: "searchView",
    bgcolor: $color("white")
  },
  views: [{
    type: "input",
    props: {
      id: "input",
      placeholder: "输入番号或演员进行搜索",
      id: "input",
      font: $font(13),
      clearsOnBeginEditing: false,
      bgcolor: $color("#f3f3f3"),
      radius: 8,
      stickyHeader: false
    },
    events: {
      returned: function(sender) {
        $("menu").index = 0
        if (sender.text) {
          sender.blur()
          $("initialView").data = [];
          mode = "search";
          keyword = sender.text;
          page = 0;
          getInitial(mode, keyword);

        } else {
          $("initialView").data = [];
          sender.blur()
          mode = "home"
          page = 0
          getInitial(mode)
        }
        $("initialView").contentOffset = $point(0, 0);
      }
    },
    layout: function(make, view) {
      make.left.right.top.inset(5)
      make.height.equalTo(30)
    }
  }, {
    type: "matrix",
    props: {
      id: "initialView",
      itemHeight: 180,
      columns: 3,
      spacing: 1,
      square: false,
      bgcolor: $color("clear"),
      template: [{
        type: "image",
        props: {
          id: "initialCover",
        },
        layout: $layout.fill
      }, {
        type: "label",
        props: {
          id: "info",
          bgcolor: $rgba(0, 0, 0, 0.4),
          textColor: $color("white"),
          align: $align.center,
          font: $font(10),
          autoFontSize: true
        },
        layout: function(make) {
          make.left.right.inset(0)
          make.bottom.inset(0)
          make.height.equalTo(20)
        },
      }],
    },
    layout: function(make, view) {
      make.left.right.bottom.inset(5)
      make.top.equalTo($("input").bottom).offset(5)
    },
    events: {
      didReachBottom(sender) {
        sender.endFetchingMore();
        if ($("menu").index == 0) {
          $ui.loading = true
          getInitial(mode, keyword);

        }

      },
      didSelect(sender, indexPath, data) {
        //$ui.action(data.title)
        favSrc = data.initialCover.src
        favInfo = data.info.text
        favLink = data.link
        favCode = data.code
        getDetail(data.link)
        $ui.push(detailView)
        if ($("menu").index == 0) {
          if (LocalFavList.indexOf(favLink) > -1) {
            $("favorite").title = "取消收藏"
          }
        } else if ($("menu").index == 1) {
          $("favorite").title = "归档"
        } else {
          $("favorite").title = "删除"
        }
      }
    }

  }],
  layout: function(make, view) {
    make.left.right.bottom.inset(0)
    make.top.equalTo($("menu").bottom)
  }

}

const detailView = {
  type: "view",
  props: {
    title: "详情页"
  },
  views: [{
    type: "text",
    props: {
      id: "filmName",
      //text: "Originated in Power Flownhttps://t.me/Flow_Script\nVersion: 1.1",
      editable: false,
      textColor: $color("black"),
      font: $font(15),
      align: $align.left,
      //autoFontSize: true,
      //scrollEnabled: false
    },

    layout: function(make, view) {
      make.top.inset(10)
      make.height.equalTo(50)
      make.width.equalTo($device.info.screen.width)
    }
  }, {
    type: "image",
    props: {
      id: "filmCover",
      //scale: 2,
      //src: "https://i.loli.net/2017/11/14/5a0a553e1c420.jpg"
    },
    layout: function(make, view) {
      var width = $device.info.screen.width - 20;
      var height = width * 67 / 100
      make.left.inset(10)
      make.top.equalTo($("filmName").bottom).offset(10)
      make.size.equalTo($size(width, height))
    }
  }, {
    type: "text",
    props: {
      id: "filmInfo",
      //text: "时间: 2017-12-04    长度: 124分钟    发行商: SOD",
      editable: false,
      textColor: $color("black"),
      font: $font("bold", 12),
      align: $align.center,
      scrollEnabled: false
    },

    layout: function(make, view) {
      make.top.equalTo($("filmCover").bottom).offset(5)
      make.height.equalTo(25)
      make.width.equalTo($device.info.screen.width)
    }
  }, {
    type: "matrix",
    props: {
      id: "filmActress",
      itemHeight: 100,
      columns: 4,
      spacing: 1,
      square: false,
      bgcolor: $color("clear"),
      template: [{
        type: "image",
        props: {
          id: "actressCover",
        },
        layout: function(make, view) {
          make.left.right.top.inset(5);
          make.height.equalTo(80)
        }
      }, {
        type: "label",
        props: {
          id: "actressName",
          textColor: $color("black"),
          //text: "dfcvv",
          align: $align.center,
          font: $font(10),
          autoFontSize: true
        },
        layout: function(make) {
          make.left.right.inset(0)
          make.top.equalTo($("actressCover").bottom).offset(5)
          //make.height.equalTo(20)
        },
      }],
    },
    layout: function(make, view) {
      make.left.right.bottom.inset(5)
      make.top.equalTo($("filmInfo").bottom).offset(5)
    },
    events: {
      didSelect(sender, indexPath, data) {
        //$ui.action(data.actressName.text)
        url = data.link
        var actress = data.actressName.text
        var cover = data.actressCover.src
        actressPage = 0
        actressView(actress, cover)
        $("actressView").data = []
        getActress(url)
      }
    }

  }, {
    type: "button",
    props: {
      id: "megnet",
      bgcolor: $color("black"),
      radius: 0,
      title: "搜磁链",
      alpha: 0.7
    },
    layout: function(make, view) {
      make.left.bottom.inset(0)
      make.width.equalTo(view.super).dividedBy(2).offset(-1)
      make.height.equalTo(30)
    },
    events: {
      tapped(sender) {
        $safari.open({
          url: "https://cn.torrentkitty.tv/search/" + encodeURI(favCode)
        })
      }
    }

  }, {
    type: "button",
    props: {
      id: "favorite",
      bgcolor: $color("black"),
      radius: 0,
      title: "收藏",
      alpha: 0.7
    },
    layout: function(make, view) {
      make.bottom.inset(0)
      make.left.equalTo($("megnet").right).offset(2)
      make.width.equalTo(view.super).dividedBy(2)
      make.height.equalTo(30)
    },
    events: {
      tapped(sender) {
        var data = {
          "src": favSrc,
          "info": favInfo,
          "link": favLink
        }
        if ($("menu").index == 0) {
          if ($("favorite").title == "收藏") {
            $("favorite").title = "取消收藏"
            favoriteButtonTapped("add", data)
          } else if ($("favorite").title == "取消收藏") {
            $("favorite").title = "收藏"
            favoriteButtonTapped("cancel", data)
          }
        } else if ($("menu").index == 1) {
          if ($("favorite").title == "归档") {

            $("favorite").title = "已归档"
            favoriteButtonTapped("archive", data)

          }
        } else {
          if ($("favorite").title == "删除") {
            $("favorite").title = "已删除"
            favoriteButtonTapped("del", data)
          }

        }

      }
    }

  }],
  layout: $layout.fill

}

function actressView(actress, cover) {
  $ui.push({
    type: "view",
    props: {
      title: actress
    },
    views: [{
      type: "image",
      props: {
        id: "actress",
        src: cover
      },
      layout: function(make, view) {
        make.left.top.inset(5)
        make.width.equalTo(125)
        make.height.equalTo(125)
      }
    }, {
      type: "text",
      props: {
        id: "actressInfo",
        text: "生日: ????-??-??\n\n年龄: ??\n\n身高: ??cm\n\n罩杯: ?",
        editable: false,
        textColor: $color("black"),
        font: $font("bold", 15),
        align: $align.left,
        scrollEnabled: false

      },
      layout: function(make, view) {
        make.left.equalTo($("actress").right).offset(0)
        make.top.inset(0)
        make.height.equalTo(150)
        make.width.equalTo(150)
      }
    }, {
      type: "text",
      props: {
        id: "actressInfo2",
        text: "胸围: ??cm\n\n腰围: ??cm\n\n臀围: ??cm",
        editable: false,
        textColor: $color("black"),
        font: $font("bold", 15),
        align: $align.left,
        scrollEnabled: false

      },
      layout: function(make, view) {
        make.left.equalTo($("actressInfo").right).offset(-5)
        make.top.inset(0)
        make.height.equalTo(150)
        make.width.equalTo(100)
      }
    }, {
      type: "matrix",
      props: {
        id: "actressView",
        itemHeight: 180,
        columns: 3,
        spacing: 1,
        square: false,
        bgcolor: $color("white"),
        template: [{
          type: "image",
          props: {
            id: "actressCovers",
          },
          layout: $layout.fill
        }, {
          type: "label",
          props: {
            id: "actressInfos",
            bgcolor: $rgba(0, 0, 0, 0.4),
            textColor: $color("white"),
            align: $align.center,
            font: $font(10),
            autoFontSize: true
          },
          layout: function(make) {
            make.left.right.bottom.inset(0)
            make.height.equalTo(25)
          },
        }],
      },
      layout: function(make, view) {
        make.left.right.inset(5)
        make.bottom.inset(0)
        make.top.equalTo($("actressInfo").bottom)
      },
      events: {
        didReachBottom(sender, data) {
          $ui.loading = true
          sender.endFetchingMore();
          getActress(url);

        },
        didSelect(sender, indexPath, data) {

          favSrc = data.actressCovers.src
          favInfo = data.actressInfos.text
          favLink = data.link
          //$ui.action(data.link)
          getDetail(data.link)
          $ui.push(detailView)
          if ($("menu").index == 0) {
            if (LocalFavList.indexOf(favLink) > -1) {
              $("favorite").title = "取消收藏"
            }
          } else if ($("menu").index == 1) {
            $("favorite").title = "归档"
          } else {
            $("favorite").title = "删除"
          }

        }
      }

    }],
    layout: $layout.fill
  })
}

$ui.render({
  props: {
    title: "欲望清单"
  },
  views: [{
      type: "menu",
      props: {
        id: "menu",
        items: ["搜索", "收藏", "归档"]
      },
      layout: function(make) {
        make.top.left.right.inset(0)
        make.height.equalTo(35)
      },
      events: {
        changed(sender) {
          switch (sender.index) {
            case 0:
              $("input").placeholder = "输入番号或演员进行搜索"
              $("initialView").hidden = false
              $("initialView").data = []
              $("initialView").contentOffset = $point(0, 0)
              page = 0
              mode = "home"
              keyword = ""
              getInitial(mode)
              break;
            case 1:
              $("initialView").data = [];
              $("initialView").contentOffset = $point(0, 0);
              var length = LocalFavList.length;
              $("input").text = ("")
              $("input").placeholder = "已收藏 " + length + " 个番号"
              if (length == 0) {
                $("initialView").hidden = true
              } else {
                $("initialView").hidden = false
              }
              LocalData.favorite.map(function(i) {
                $("initialView").data = $("initialView").data.concat({
                  link: i.link,
                  initialCover: {
                    src: i.src
                  },
                  info: {
                    text: i.info
                  }
                })
              })

              break;
            case 2:
              var length = LocalArcList.length;
              $("input").text = ("")
              $("input").placeholder = "已归档 " + length + " 个番号"
              if (length == 0) {
                $("initialView").hidden = true
              } else {
                $("initialView").hidden = false
              }
              $("initialView").data = []
              $("initialView").contentOffset = $point(0, 0)
              LocalData.archive.map(function(i) {
                $("initialView").data = $("initialView").data.concat({
                  link: i.link,
                  initialCover: {
                    src: i.src
                  },
                  info: {
                    text: i.info
                  }
                })
              })
              break;

          }
        }
      }
    },
    searchView,
  ]
})

function getInitial(mode, keyword) {
  page++
  if (mode == "home") {
    url = "https://avmo.club/cn/page/"
  } else if (mode == "search") {
    url = encodeURI("https://avmo.club/cn/search/" + keyword + "/page/")
  } else if (mode = "actress") {
    url = keyword + "/page/"
  }
  $http.request({
    url: url + page,
    handler: function(resp) {
      if (resp.data.indexOf("404 Not Found") > -1) {
        $ui.toast("🙈 到底了", 0.1)
        return
      }
      if (resp.data.indexOf("没有结果") > -1) {
        $ui.toast("💔 搜索无果,车牌无效")
        return
      }
      $ui.loading = false
      var reg = /<a class="movie-box"[\s\S]*?<\/span>/g;
      var match = resp.data.match(reg)
      //$ui.action(match)
      var data = []
      match.map(function(i) {
        var link = /href="([\s\S]*?)(")/.exec(i)[1];
        var image = /<img src="([\s\S]*?)(")/.exec(i)[1];
        var title = /title="(.*?)(">)/.exec(i)[1];
        var code = /<br><date>(.*?)<\/date>/.exec(i)[1];
        var date = /\/\s<date>(.*?)<\/date><\/span>/.exec(i)[1];
        $("initialView").data = $("initialView").data.concat({
          //title: title,
          code: code,
          link: link,
          initialCover: {
            src: image
          },
          info: {
            text: code + " | " + date
          }
        });

      })
    }
  })
}

function getDetail(url) {
  $http.request({
    url: url,
    handler: function(resp) {
      var actressReg = /<a class="avatar-box"[\s\S]*?<\/a>/g;
      var match = resp.data.match(actressReg)
      if (match) {
        match.map(function(i) {
          var name = /<span>(.*?)<\/span>/.exec(i)[1];
          var nameLink = /href="([\s\S]*?)(")/.exec(i)[1];
          var nameImage = /<img src="([\s\S]*?)(")/.exec(i)[1];
          //$ui.action(nameImage)
          $("filmActress").data = $("filmActress").data.concat({
            link: nameLink,
            actressCover: {
              src: nameImage
            },
            actressName: {
              text: name
            }
          });
        })

      }
      var filmCover = /<a class="bigImage" href="(.*?)"/.exec(resp.data)[1];
      $("filmCover").src = filmCover;
      var filmName = /<a class="bigImage" href="(.*?)" title="(.*?)"/.exec(resp.data)[2];
      $("filmName").text = filmName;
      var filmTime = /<span class="header">发行时间:<\/span>([\s\S]*?)<\/p>/.exec(resp.data)[1];
      var filmLast = /<span class="header">长度:<\/span>([\s\S]*?)<\/p>/.exec(resp.data)[1];
      var filmSource = /<p class="header">发行商:[\s\S]*?">(.*?)<\/a>/.exec(resp.data)[1];
      $("filmInfo").text = "时间: " + filmTime + "    长度: " + filmLast + "    发行商: " + filmSource;

      //$ui.action(filmSource)

    }
  })

}

function getActress(url) {
  actressPage++
  $http.request({
    url: url + "/page/" + actressPage,
    handler: function(resp) {
      if (resp.data.indexOf("404 Not Found") > -1) {
        $ui.toast("🙈 到底了", 0.1)
        return
      }
      if (actressPage == 1) {
        var temp = /<div class="photo-info">[\s\S]*?生日:\s(.*?)<\/p>/.exec(resp.data)
        if (temp) {
          var birth = temp[1];
        } else {
          var birth = "????-??-??"
        }
        var temp = /<div class="photo-info">[\s\S]*?年龄:\s(.*?)<\/p>/.exec(resp.data)
        if (temp) {
          var age = temp[1]
        } else {
          var age = "??"
        }
        var temp = /<div class="photo-info">[\s\S]*?身高:\s(.*?)<\/p>/.exec(resp.data)
        if (temp) {
          var height = temp[1]
        } else {
          var height = "???cm"
        }
        var temp = /<div class="photo-info">[\s\S]*?罩杯:\s(.*?)<\/p>/.exec(resp.data)
        if (temp) {
          var breast = temp[1]
        } else {
          var breast = "?"
        }
        var temp = /<div class="photo-info">[\s\S]*?胸围:\s(.*?)<\/p>/.exec(resp.data)
        if (temp) {
          var xiong = temp[1]
        } else {
          var xiong = "??cm"
        }
        var temp = /<div class="photo-info">[\s\S]*?腰围:\s(.*?)<\/p>/.exec(resp.data)
        if (temp) {
          var yao = temp[1]
        } else {
          var yao = "??cm"
        }
        var temp = /<div class="photo-info">[\s\S]*?臀围:\s(.*?)<\/p>/.exec(resp.data)
        if (temp) {
          var tun = temp[1]
        } else {
          var tun = "??cm"
        }
        $("actressInfo").text = "生日: " + birth + "\n\n年龄: " + age + "\n\n身高: " + height + "\n\n罩杯: " + breast;
        $("actressInfo2").text = "胸围: " + xiong + "\n\n腰围: " + yao + "\n\n臀围: " + tun;

      }

      var reg = /<a class="movie-box"[\s\S]*?<\/span>/g;
      var match = resp.data.match(reg)
      //$ui.action(match)
      var data = []
      match.map(function(i) {
        var link = /href="([\s\S]*?)(")/.exec(i)[1];
        var image = /<img src="([\s\S]*?)(")/.exec(i)[1];
        var title = /title="(.*?)(">)/.exec(i)[1];
        var code = /<br><date>(.*?)<\/date>/.exec(i)[1];
        var date = /\/\s<date>(.*?)<\/date><\/span>/.exec(i)[1];
        $("actressView").data = $("actressView").data.concat({
          title: title,
          link: link,
          actressCovers: {
            src: image
          },
          actressInfos: {
            text: code + " | " + date
          }
        });

      })
    }
  })
}

function favoriteButtonTapped(mode, data) {
  if (mode == "add") {
    LocalData.favorite.push(data)
    LocalFavList.push(data.link)

  } else if (mode == "cancel") {
    idx = LocalFavList.indexOf(data.link)
    LocalFavList.splice(idx, 1)
    LocalData.favorite.splice(idx, 1)

  } else if (mode == "archive") {
    idx = LocalFavList.indexOf(data.link)
    LocalFavList.splice(idx, 1)
    LocalData.favorite.splice(idx, 1)
    if ($("menu").index == 1) {
      $("initialView").delete(idx)
      var length = LocalFavList.length;
      $("input").placeholder = "已收藏 " + length + " 个番号"
    }
    LocalData.archive.push(data)
    LocalArcList.push(data.link)
  } else if (mode == "del") {
    idx = LocalArcList.indexOf(data.link)
    LocalArcList.splice(idx, 1)
    LocalData.archive.splice(idx, 1)
    if ($("menu").index == 2) {
      $("initialView").delete(idx)
      var length = LocalArcList.length;
      $("input").placeholder = "已归档 " + length + " 个番号"
    }
  }
  writeCache()
}

function writeCache() {
  $file.write({
    data: $data({ string: JSON.stringify(LocalData) }),
    path: LocalDataPath
  })
}

function main() {
  page = 0
  mode = "home"
  keyword = ""
  getInitial(mode)
  if ($file.read(LocalDataPath)) {
    LocalData = JSON.parse($file.read(LocalDataPath).string);
    LocalFavList = LocalData.favorite.map(i => i.link)
    LocalArcList = LocalData.archive.map(i => i.link)
  } else {
    LocalData = { "favorite": [], "archive": [] };
    LocalFavList = [];
    LocalArcList = [];
  };
}

LocalDataPath = "drive://HList.json"
main()