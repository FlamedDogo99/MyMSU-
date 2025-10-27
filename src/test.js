function TEST() {
  var e, t, n, r = this, a = this.props, o = a.intl, i = a.cards, l = a.classes, s = a.dependencies, c = a.preferences, d = a.user, f = a.announcements, m = a.category, h = a.categories, w = a.showDashboardType, C = this.state, A = C.savingDashboard, k = C.searchData, x = C.searchResults, E = C.miniCards, S = C.cardInDrawer, T = C.selectedCategory, P = C.miniCardView, _ = C.hasMounted, O = C.homepageTabsPopperAnchorEl, R = null, I = Boolean((null == s ? void 0 : s.allCardsAndRoles) && (null == s ? void 0 : s.categories)), N = !I;
  I && ("bookmarks" === w ? "home" === T ? c && c.dashboard && c.dashboard.cards && !A && (R = this.generateBookmarkCardDetails()) : R = this.generateDiscoverCardDetails() : "discover" !== w && "profile" !== w || (R = this.generateDiscoverCardDetails()));
  var j = (0,
    g.default)(e = [{
    label: o.formatMessage({
      id: "dashboardTabs.home"
    }),
    id: "home"
  }]).call(e, (0,
    b.default)((0,
    y.default)(t = (0,
    p.default)(h).call(h, function(e) {
    var t = (0,
      p.default)(i).call(i, function(t) {
      var n;
      return (0,
        v.default)(n = e.cards).call(n, t.id)
    })
      , n = (0,
      J.getAvailableCards)(t, d).length > 0;
    return e.cards && e.cards.length > 0 && !1 !== e.display && n
  })).call(t, function(e) {
    var t = (0,
      te.getCategoriesIntl)(e.label);
    return {
      label: t = t ? o.formatMessage({
        id: t
      }) : e.label,
      id: e.id
    }
  })))
    , z = (0,
    u.default)(j).call(j, function(e) {
    return e.id === r.state.selectedCategory
  })
    , B = z ? z.label : "Home"
    , F = ""
    , V = !1;
  switch (w) {
    case "discover":
      if (m) {
        var K = (0,
          te.getCategoriesIntl)(m.label);
        F = K = K ? o.formatMessage({
          id: K
        }) : m.label;
        break
      }
      F = o.formatMessage({
        id: "appmenu.allCards"
      });
      break;
    case "profile":
      F = o.formatMessage({
        id: "appmenu.profile"
      });
      break;
    case "error":
      V = !0;
      break;
    default:
      F = ""
  }
  var ee = {
    right: 16,
    bottom: 16,
    zIndex: 100,
    left: "unset"
  };
  "rtl" === this.context.dir && (ee = {
    left: 16,
    bottom: 16,
    zIndex: 100,
    right: "unset"
  });
  var ae = (0,
    J.getAvailableCards)(i, d)
    , oe = (0,
    u.default)(h).call(h, function(e) {
    return "My Account" === e.defaultLabel
  })
    , ie = !N && c && c.dashboard && R ? M.default.createElement("div", {
    className: l.ethosDashboard
  }, M.default.createElement(L.default, {
    showMiniCards: E,
    searchData: k,
    userDashboard: c.dashboard,
    cardDetails: R,
    availableCards: k ? x : ae,
    scrollClass: this.state.scrollClass,
    showDashboardType: "discover",
    category: oe.id,
    clearSearch: this.clearSearch
  })) : M.default.createElement("div", {
    className: l.ethosDashboard
  }, M.default.createElement(D.default, {
    showDashboardType: w,
    scrollClass: this.state.scrollClass
  }));
  return M.default.createElement("div", {
    id: "spaceDetailOuterDiv"
  }, M.default.createElement(U.default, null, M.default.createElement(H.SpaceDetailProvider, {
    value: {
      availableCards: ae,
      userBookmarks: c && c.dashboard ? c.dashboard.cards : [],
      category: m,
      miniCards: E,
      setCardInDrawer: this.setCardInDrawer,
      cardInDrawer: S,
      selectedCategory: T,
      miniCardView: P,
      handleMiniCardView: this.handleMiniCardView
    }
  }, M.default.createElement(Q.default, {
    label: F,
    errorView: V
  }, "bookmarks" === w && M.default.createElement(W.Typography, {
    variant: "h1",
    className: l.srOnly
  }, o.formatMessage({
    id: "header.appHome"
  }))), !N && "bookmarks" === w && f && f.length > 0 && M.default.createElement("div", {
    role: "status",
    "aria-label": o.formatMessage({
      id: "announcementCard.srOnlyLabel"
    })
  }, M.default.createElement(G.default, {
    onDismiss: this.onAnnouncementDismiss,
    onUndo: this.onAnnouncementUndo,
    announcements: f
  })), M.default.createElement("div", {
    role: "main",
    id: "maincontent"
  }, "profile" !== w && "error" !== w && "discover" !== w && M.default.createElement("div", {
    id: "dashboard_tabs_container",
    className: l.dashboardTabsContainer
  }, M.default.createElement(W.Box, {
    className: document.documentElement.clientWidth < 650 ? l.dashboardTabs : l.dashboardTabsLarge
  }, document.documentElement.clientWidth >= 650 && M.default.createElement(W.Tabs, {
    className: l.tabs,
    value: T,
    scrollButtons: !0,
    onChange: function(e, t) {
      return r.handleTabChange(t)
    }
  }, M.default.createElement(W.Tab, {
    id: "home_tab",
    label: o.formatMessage({
      id: "dashboardTabs.home"
    }),
    "aria-label": o.formatMessage({
      id: "dashboardTabs.home"
    }),
    "data-pendo-feature": "experience-homepagetab-home",
    value: "home",
    ref: this.homeTabRef,
    "aria-controls": "home",
    "aria-expanded": "home" === T,
    onClick: function(e) {
      e.currentTarget.blur()
    }
  }), (0,
    y.default)(n = (0,
    p.default)(h).call(h, function(e) {
    var t = (0,
      p.default)(i).call(i, function(t) {
      var n;
      return (0,
        v.default)(n = e.cards).call(n, t.id)
    })
      , n = (0,
      J.getAvailableCards)(t, d).length > 0;
    return e.cards && e.cards.length > 0 && !1 !== e.display && n
  })).call(n, function(e, t) {
    var n = (0,
      te.getCategoriesIntl)(e.label);
    n = n ? o.formatMessage({
      id: n
    }) : e.label;
    var a = 0;
    return "category" === e.type && a++,
      M.default.createElement(W.Tab, {
        key: t,
        id: "".concat(e.label, "_tab"),
        label: n,
        "aria-label": e.label,
        "aria-controls": e.id,
        "aria-expanded": T === e.id,
        "data-pendo-feature": "defaultCategory" === e.type ? "experience-homepagetab-".concat(e.defaultLabel.toLowerCase()) : "experience-homepagetab-custom-category-".concat(a),
        ref: 0 === t ? r.categoryTabRef : null,
        value: e.id,
        onClick: function(e) {
          e.currentTarget.blur()
        }
      })
  })), document.documentElement.clientWidth < 650 && M.default.createElement(W.Button, {
    id: "ButtonVariantText",
    variant: "text",
    ref: this.homeTabRef,
    className: l.mobileCategoryButton,
    dropdown: (0,
      y.default)(j).call(j, function(e, t) {
      return M.default.createElement(W.DropdownButtonItem, {
        key: t,
        onClick: function(t) {
          t.currentTarget.blur(),
            r.handleCategoryMobileButtonChange(e.id)
        }
      }, e.label)
    })
  }, B), M.default.createElement("div", {
    className: l.dashboardTabsRight
  }, !(0,
    ne.isInNativeApp)() && document.documentElement.clientWidth < 650 && M.default.createElement(W.Tooltip, {
    title: o.formatMessage({
      id: "dashboardTabs.viewAllCards"
    })
  }, M.default.createElement("div", {
    ref: this.discoverButtonRef
  }, M.default.createElement(W.IconButton, {
    id: "discover_button",
    color: "gray",
    "aria-label": o.formatMessage({
      id: "dashboardTabs.viewAllCards"
    }),
    className: l.tabsDiscoverIconButton,
    onClick: this.handleDiscoverMoreClick,
    role: "link"
  }, M.default.createElement(Z.AppConsumer, null, function(e) {
    return M.default.createElement(q.default, {
      dir: e.dir,
      name: "search"
    })
  })))), !(0,
    ne.isInNativeApp)() && document.documentElement.clientWidth >= 650 && M.default.createElement("div", {
    ref: this.discoverButtonRef
  }, M.default.createElement(W.Button, {
    className: l.tabsDiscoverButton,
    variant: "text",
    color: "secondary",
    id: "discover_button",
    onClick: this.handleDiscoverMoreClick,
    startIcon: M.default.createElement(Z.AppConsumer, null, function(e) {
      return M.default.createElement(q.default, {
        dir: e.dir,
        name: "search"
      })
    }),
    role: "link"
  }, o.formatMessage({
    id: "dashboardTabs.viewAllCards"
  }))), "discover" !== w && document.documentElement.clientWidth < 650 && M.default.createElement(W.ToggleButtonGroup, {
    "aria-label": o.formatMessage({
      id: "ethosDashboard.miniCardsToggleGroup"
    }),
    className: l.toggleButton,
    exclusive: !0,
    value: this.state.miniCardView,
    onChange: this.handleMiniCardView,
    size: "small"
  }, M.default.createElement(W.ToggleButton, {
    value: "grid",
    "aria-label": o.formatMessage({
      id: "ethosDashboard.gridView"
    })
  }, M.default.createElement(Z.AppConsumer, null, function(e) {
    return M.default.createElement(q.default, {
      dir: e.dir,
      name: "grid-view"
    })
  })), M.default.createElement(W.ToggleButton, {
    value: "list",
    "aria-label": o.formatMessage({
      id: "ethosDashboard.listView"
    })
  }, M.default.createElement(Z.AppConsumer, null, function(e) {
    return M.default.createElement(q.default, {
      dir: e.dir,
      name: "list-view"
    })
  })))))), !c.homepageTabsWizardShown && "bookmarks" === w && _ && M.default.createElement(re.default, {
    homepageTabsPopperAnchorEl: O,
    setHomepageTabsPopperAnchorEl: this.setHomepageTabsPopperAnchorEl,
    homeTabRef: this.homeTabRef,
    categoryTabRef: this.categoryTabRef,
    discoverButtonRef: this.discoverButtonRef,
    showDashboardType: w
  }), N && "profile" !== w && "error" !== w && M.default.createElement("div", {
    className: l.ethosDashboard
  }, M.default.createElement(D.default, {
    showDashboardType: w,
    scrollClass: this.state.scrollClass
  })), "profile" === w && M.default.createElement($.default, {
    user: d,
    myAccountView: ie,
    availableCards: ae
  }), "error" === w && M.default.createElement(Y.default, null), !N && c && c.dashboard && R && M.default.createElement("div", {
    className: l.ethosDashboard
  }, M.default.createElement(L.default, {
    searchData: k,
    userDashboard: c.dashboard,
    cardDetails: R,
    availableCards: k ? x : ae,
    scrollClass: this.state.scrollClass,
    showDashboardType: w,
    category: null == m ? void 0 : m.id,
    clearSearch: this.clearSearch,
    selectedCategory: T
  })), M.default.createElement(X.default, {
    showUnder: 60,
    style: ee
  }, M.default.createElement(W.Tooltip, {
    title: o.formatMessage({
      id: "app.scrollToTop"
    })
  }, M.default.createElement(W.IconButton, {
    color: "primary",
    "aria-label": o.formatMessage({
      id: "app.scrollToTop"
    }),
    "data-pendo-feature": "experience-space-scrollup"
  }, M.default.createElement(q.default, {
    name: "arrow-up"
  }))))), M.default.createElement(W.Snackbar, {
    variant: this.state.snackbar.isError ? "error" : "success",
    open: this.state.snackbar.show,
    onClose: this.state.snackbar.onClose || this.onCloseSnackbar,
    onUndoClick: this.state.snackbar.undoAction ? this.state.snackbar.undoAction : void 0,
    ContentProps: {
      "aria-describedby": "message-id"
    },
    message: M.default.createElement("span", {
      id: "message-id"
    }, this.state.snackbar.message)
  }))))
}