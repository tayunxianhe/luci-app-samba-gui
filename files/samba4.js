'use strict';
'require view';
'require fs';
'require uci';

function joinPath(base, name) {
	if (base === '/')
		return '/' + name;
	if (base.endsWith('/'))
		return base + name;
	return base + '/' + name;
}

function baseName(path) {
	var p = path.replace(/\/+$/, '');
	var i = p.lastIndexOf('/');
	return i >= 0 ? p.substring(i + 1) : p;
}

function dirName(path) {
	var p = path.replace(/\/+$/, '');
	var i = p.lastIndexOf('/');
	return i <= 0 ? '/' : p.substring(0, i + 1);
}

/* ---------- 样式（一次性注入） ---------- */
var CSS = [
'.smb-wrap{font-size:14px;color:#333;}',
'.smb-card{background:#fff;border:1px solid #E3E6F0;border-radius:10px;box-shadow:0 1px 4px rgba(60,70,120,.10);margin:16px 0;overflow:hidden;}',
'.smb-card-topbar{height:5px;background:linear-gradient(90deg,#4A55B8,#6C78E0);}',
'.smb-card-head{display:flex;align-items:center;padding:10px 18px;font-weight:700;color:#3A3F51;cursor:pointer;user-select:none;font-size:14px;}',
'.smb-card-head .smb-arrow{display:inline-block;width:18px;color:#4A55B8;font-size:12px;transition:transform .15s;}',
'.smb-card-head.collapsed .smb-arrow{transform:rotate(-90deg);}',
'.smb-card-body{margin:0 18px 16px 30px;border-left:3px solid #E3E7F7;padding:6px 0 6px 24px;}',
'.smb-field{display:flex;align-items:center;margin:14px 0;}',
'.smb-field>label{width:190px;flex-shrink:0;font-weight:700;color:#3A3F51;font-size:14px;}',
'.smb-field .smb-control{flex:1;min-width:0;max-width:460px;}',
'.smb-input{border:1px solid #D5D9E8;border-radius:8px;padding:9px 12px;font-size:14px;width:100%;box-sizing:border-box;background:#fff;color:#333;}',
'.smb-input::placeholder{color:#B8BECF;}',
'.smb-input:focus{border-color:#6C78E0;outline:none;box-shadow:0 0 0 3px rgba(108,120,224,.15);}',
'.smb-input:disabled{background:#F1F3F8;color:#A6ACBF;cursor:not-allowed;box-shadow:none;}',
'select.smb-input{appearance:auto;width:220px;}',
'.smb-chk{display:flex;align-items:center;gap:8px;cursor:pointer;color:#444;}',
'.smb-chk input{width:16px;height:16px;accent-color:#5B66C4;cursor:pointer;}',
'.smb-btn{border:none;border-radius:8px;cursor:pointer;font-size:14px;padding:9px 20px;color:#fff;background:#5B66C4;white-space:nowrap;transition:background .12s;}',
'.smb-btn:hover{background:#4A55B8;}',
'.smb-btn:disabled{background:#B9BFD9;cursor:not-allowed;}',
'.smb-btn-danger{background:#EF5B7B;}',
'.smb-btn-danger:hover{background:#E14A6D;}',
'.smb-btn-lg{font-size:15px;padding:11px 26px;border-radius:10px;font-weight:600;}',
'.smb-btn-sm{font-size:13px;padding:7px 14px;border-radius:7px;}',
'.smb-crumb-row{display:flex;align-items:center;gap:10px;margin:10px 0 4px;}',
'.smb-crumb-row .smb-crumb{flex:1;min-width:0;margin:0;}',
'.smb-mkdir-row{display:none;align-items:center;gap:8px;margin:6px 0 4px;padding:8px 10px;background:#F6F7FC;border:1px solid #E0E4F5;border-radius:8px;}',
'.smb-mkdir-row .smb-input{width:240px;padding:7px 10px;font-size:13px;}',
'.smb-mkdir-err{color:#C22742;font-size:12px;}',
'.smb-btn-plain{background:#fff;color:#5B66C4;border:1px solid #C9CFEA;}',
'.smb-btn-plain:hover{background:#EEF0FD;}',
'.smb-hint{color:#98A0B5;font-size:12px;margin-top:4px;}',
'.smb-share-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}',
'.smb-share-card{display:flex;align-items:center;border:1px solid #D9DDEA;border-radius:8px;background:#fff;margin:16px 0;overflow:hidden;min-width:760px;}',
'.smb-share-table{flex:1;min-width:0;border-collapse:collapse;font-size:13px;}',
'.smb-share-table th{background:#F6F7FC;color:#4A5068;font-weight:700;padding:9px 10px;border:1px solid #D9DDEA;text-align:left;white-space:nowrap;}',
'.smb-share-table td{padding:9px 10px;border:1px solid #D9DDEA;color:#333;word-break:break-all;}',
'.smb-share-table td.smb-idx{text-align:center;color:#8A90A5;width:34px;}',
'.smb-share-actions{display:flex;align-items:center;gap:12px;padding:0 20px;flex-shrink:0;}',
'.smb-empty{padding:28px;text-align:center;color:#98A0B5;border:1px dashed #D5D9E8;border-radius:8px;background:#FAFBFE;margin:14px 0;font-size:14px;}',
/* 弹窗 */
'.smb-overlay{position:fixed;inset:0;background:rgba(30,34,60,.45);z-index:9999;display:flex;align-items:center;justify-content:center;}',
'.smb-modal{background:#fff;border-radius:14px;max-width:720px;width:92%;max-height:84%;overflow:auto;padding:0;box-shadow:0 12px 40px rgba(20,25,60,.35);color:#333;}',
'.smb-modal-title{position:sticky;top:0;background:#fff;padding:16px 22px 12px;font-size:16px;font-weight:700;color:#3A3F51;border-bottom:1px solid #EEF0F7;z-index:1;}',
'.smb-modal-body{padding:16px 22px 20px;}',
'.smb-modal-foot{padding:12px 22px 18px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid #EEF0F7;}',
'.smb-modal .smb-field>label{width:150px;}',
'.smb-modal .smb-field .smb-control{max-width:none;}',
/* 选项卡（单选） */
'.smb-opts{display:flex;flex-wrap:wrap;gap:10px;}',
'.smb-opt{display:inline-flex;align-items:center;gap:7px;border:1.5px solid #D5D9E8;border-radius:9px;padding:8px 16px;cursor:pointer;background:#fff;color:#555;font-size:14px;user-select:none;transition:all .12s;}',
'.smb-opt:hover{border-color:#A9B0E8;}',
'.smb-opt.on{border-color:#5B66C4;background:#EEF0FD;color:#3F49B5;font-weight:600;}',
'.smb-opt input{display:none;}',
/* 目录浏览器 */
'.smb-crumb{display:flex;align-items:center;gap:6px;background:#F1F3FB;border:1px solid #E0E4F5;border-radius:8px;padding:8px 12px;margin:10px 0;font-size:13px;color:#3A3F51;flex-wrap:wrap;}',
'.smb-crumb b{color:#3F49B5;}',
'.smb-dirlist{max-height:320px;overflow:auto;border:1px solid #E0E4F5;border-radius:10px;padding:6px;background:#FAFBFE;}',
'.smb-dir-group{padding:7px 10px;background:#E8EBF8;color:#4A55B8;font-size:12px;font-weight:700;border-radius:6px;margin:6px 0 3px;}',
'.smb-dir-item{display:flex;align-items:center;gap:8px;padding:9px 12px;cursor:pointer;border-radius:7px;font-size:13.5px;border-bottom:1px solid #F0F1F8;}',
'.smb-dir-item:hover{background:#EEF0FD;}',
'.smb-dir-item .smb-tag{color:#2962ff;font-size:11px;background:#E8F1FF;border-radius:4px;padding:1px 6px;}',
'.smb-dir-item.smb-up{color:#3F49B5;font-weight:700;}',
'.smb-dir-empty{padding:14px;color:#98A0B5;font-size:13px;}',
'.smb-adv summary{cursor:pointer;font-weight:700;color:#555;padding:8px 0;user-select:none;}',
'.smb-adv{margin-top:16px;border:1px solid #EEF0F7;border-radius:10px;padding:4px 14px 10px;background:#FCFCFE;}',
/* 用户管理 */
'.smb-user-row{display:flex;align-items:center;gap:10px;padding:9px 14px;border:1px solid #EEF0F7;border-radius:8px;margin:8px 0;background:#FBFCFE;flex-wrap:wrap;}',
'.smb-user-row .smb-username{font-weight:700;color:#3A3F51;flex:1;min-width:80px;}',
'.smb-user-add{display:flex;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap;}',
'.smb-user-add .smb-input{width:200px;}',
'.smb-badge{display:inline-block;background:#E8F1FF;color:#2962ff;font-size:11px;border-radius:4px;padding:1px 6px;margin-left:6px;vertical-align:middle;white-space:nowrap;}',
'.smb-textarea{width:100%;min-height:240px;font-family:Consolas,monospace;font-size:12px;line-height:1.5;resize:vertical;}',
'.smb-alert{padding:10px 14px;border-radius:8px;font-size:13.5px;margin:10px 0;display:none;}',
'.smb-alert.ok{display:block;background:#E8F7EE;color:#1E7E43;border:1px solid #BCE5CC;}',
'.smb-alert.err{display:block;background:#FDECEF;color:#C22742;border:1px solid #F5C2CB;}',
/* 低分辨率/小屏适配 */
'@media (max-width:760px){',
'.smb-field{flex-direction:column;align-items:flex-start;gap:6px;margin:10px 0;}',
'.smb-field>label{width:auto;}',
'.smb-field .smb-control{width:100%;max-width:none;}',
'.smb-modal .smb-field>label{width:auto;}',
'.smb-card-body{margin:0 12px 14px 16px;padding-left:14px;}',
'.smb-share-actions{padding:0 14px;gap:8px;}',
'}'
].join('\n');

var styleInjected = false;
function injectStyle() {
	if (styleInjected) return;
	var st = document.createElement('style');
	st.type = 'text/css';
	st.textContent = CSS;
	document.head.appendChild(st);
	styleInjected = true;
}

/* ---------- 简易模态框 ---------- */
var modalStack = [];
function showModal(title, contentNode, footNodes) {
	var overlay = E('div', { 'class': 'smb-overlay' });
	var dlg = E('div', { 'class': 'smb-modal' });
	dlg.appendChild(E('div', { 'class': 'smb-modal-title' }, title));
	var body = E('div', { 'class': 'smb-modal-body' });
	body.appendChild(contentNode);
	dlg.appendChild(body);
	if (footNodes && footNodes.length) {
		var foot = E('div', { 'class': 'smb-modal-foot' }, footNodes);
		dlg.appendChild(foot);
	}
	overlay.appendChild(dlg);
	overlay.addEventListener('click', function(ev) {
		if (ev.target === overlay) hideModal();
	});
	document.body.appendChild(overlay);
	modalStack.push(overlay);
	return overlay;
}
function hideModal() {
	if (modalStack.length) {
		var ov = modalStack.pop();
		if (ov && ov.parentNode)
			ov.parentNode.removeChild(ov);
	}
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('samba4'),
			L.resolveDefault(fs.stat('/usr/sbin/nmbd'), null),
			L.resolveDefault(fs.stat('/usr/sbin/samba'), null),
			L.resolveDefault(fs.stat('/usr/sbin/winbindd'), null),
			fs.read('/etc/samba/smb.conf.template').catch(function() { return ''; })
		]);
	},

	render: function(stats) {
		var self = this;
		var tmplText = '';
		try {
			var rd = stats[4];
			tmplText = (rd && rd.data != null) ? String(rd.data) : (typeof rd === 'string' ? rd : '');
		} catch (e) { tmplText = ''; }
		var hasNmbd = stats[1] && stats[1].type === 'file';
		var hasSamba = stats[2] && stats[2].type === 'file';
		var hasWinbind = stats[3] && stats[3].type === 'file';
		injectStyle();

		var container = E('div', { 'class': 'smb-wrap' });

		/* 提示条 */
		this.noticeBox = E('div', { 'class': 'smb-alert' });

		/* ================= 通用设置（不常用） ================= */
		var generalCard = E('div', { 'class': 'smb-card' });
		generalCard.appendChild(E('div', { 'class': 'smb-card-topbar' }));

		var gHead = E('div', { 'class': 'smb-card-head' }, [
			E('span', { 'class': 'smb-arrow' }, '▼'),
			_('通用设置（不常用）')
		]);
		var gBody = E('div', { 'class': 'smb-card-body' });
		gHead.addEventListener('click', function() {
			gHead.classList.toggle('collapsed');
			gBody.style.display = gHead.classList.contains('collapsed') ? 'none' : '';
		});

		this.generalWorkgroup = E('input', { 'type': 'text', 'class': 'smb-input', 'placeholder': 'WORKGROUP' });
		this.generalDescription = E('input', { 'type': 'text', 'class': 'smb-input', 'placeholder': 'Samba on OpenWRT' });
		this.generalAutoshare = E('input', { 'type': 'checkbox' });

		gBody.appendChild(this._field(_('工作组 Workgroup'), this.generalWorkgroup));
		gBody.appendChild(this._field(_('描述 Description'), this.generalDescription));
		gBody.appendChild(this._field(_('自动共享'),
			E('div', {}, [
				E('label', { 'class': 'smb-chk' }, [
					this.generalAutoshare,
					_('插入的U盘/移动硬盘自动共享给局域网')
				]),
				E('div', { 'class': 'smb-hint' }, _('开启后，插入U盘/移动硬盘会自动生成共享并显示在下方「共享目录列表」中（带"U盘自动共享"标记）。内置存储不会被自动共享，避免误删路由器文件'))
			])));

		/* ---- 原版通用设置选项 ---- */
		this.generalInterface = E('input', { 'type': 'text', 'class': 'smb-input', 'placeholder': 'lan' });
		gBody.appendChild(this._field(_('监听接口'),
			E('div', {}, [
				this.generalInterface,
				E('div', { 'class': 'smb-hint' }, _('只在指定接口上监听，留空表示 lan，多个接口用空格分隔'))
			])));

		this.generalTuning = E('input', { 'type': 'checkbox' });
		gBody.appendChild(this._field(_('额外性能调优'),
			E('div', {}, [
				E('label', { 'class': 'smb-chk' }, [this.generalTuning, _('启用社区调优参数')]),
				E('div', { 'class': 'smb-hint' }, _('可能提升写入速度和 WiFi 下表现；多个客户端同时写同一文件时不建议开启'))
			])));

		this.generalSyncIo = E('input', { 'type': 'checkbox' });
		gBody.appendChild(this._field(_('强制同步 I/O'),
			E('div', {}, [
				E('label', { 'class': 'smb-chk' }, [this.generalSyncIo, _('低端设备上可能提升速度')]),
				E('div', { 'class': 'smb-hint' }, _('用同步 I/O 代替默认的异步 I/O'))
			])));

		this.generalMacos = E('input', { 'type': 'checkbox' });
		gBody.appendChild(this._field(_('macOS 兼容共享'),
			E('div', {}, [
				E('label', { 'class': 'smb-chk' }, [this.generalMacos, _('全局启用 Apple AAPL 扩展')]),
				E('div', { 'class': 'smb-hint' }, _('为所有共享增加 macOS 兼容选项，Mac 访问更顺畅'))
			])));

		this.generalLegacy = E('input', { 'type': 'checkbox' });
		gBody.appendChild(this._field(_('兼容老设备（旧协议）'),
			E('div', {}, [
				E('label', { 'class': 'smb-chk' }, [this.generalLegacy, _('允许 SMBv1/Lanman 旧协议连接')]),
				E('div', { 'class': 'smb-hint' }, _('供不支持 SMB2/3 的老设备（旧电视、老NAS等）使用，安全性较低，无老设备需求请勿开启'))
			])));

		if (hasNmbd) {
			this.generalNetbios = E('input', { 'type': 'checkbox' });
			gBody.appendChild(this._field(_('禁用 Netbios'),
				E('label', { 'class': 'smb-chk' }, [this.generalNetbios, _('关闭旧的 NetBIOS 名称广播服务')])));
		}
		if (hasSamba) {
			this.generalAdDc = E('input', { 'type': 'checkbox' });
			gBody.appendChild(this._field(_('禁用 AD 域控制器'),
				E('label', { 'class': 'smb-chk' }, [this.generalAdDc, _('家庭使用无需域控制器，禁用可省内存')])));
		}
		if (hasWinbind) {
			this.generalWinbind = E('input', { 'type': 'checkbox' });
			gBody.appendChild(this._field(_('禁用 Winbind'),
				E('label', { 'class': 'smb-chk' }, [this.generalWinbind, _('不用 Windows 域认证时建议禁用')])));
		}

		gBody.appendChild(E('div', { 'style': 'margin-top:18px' },
			E('button', {
				'class': 'smb-btn',
				'click': function(ev) { ev.preventDefault(); self._saveGeneral(); }
			}, _('保存通用设置'))));

		generalCard.appendChild(gHead);
		generalCard.appendChild(gBody);

		/* ================= 配置模板（进阶） ================= */
		var tmplCard = E('div', { 'class': 'smb-card' });
		tmplCard.appendChild(E('div', { 'class': 'smb-card-topbar' }));
		var tHead = E('div', { 'class': 'smb-card-head collapsed' }, [
			E('span', { 'class': 'smb-arrow' }, '▼'),
			_('编辑配置模板（进阶，默认不用动）')
		]);
		var tBody = E('div', { 'style': 'display:none;padding:4px 18px 16px' });
		tHead.addEventListener('click', function() {
			tHead.classList.toggle('collapsed');
			tBody.style.display = tHead.classList.contains('collapsed') ? 'none' : '';
		});
		tBody.appendChild(E('div', { 'class': 'smb-hint', 'style': 'margin-bottom:8px' },
			_('这是生成 samba 配置所用的模板文件 /etc/samba/smb.conf.template，竖线 | 包住的变量不要修改')));
		this.generalTemplate = E('textarea', { 'class': 'smb-input smb-textarea', 'spellcheck': 'false' });
		this.generalTemplate.value = tmplText.trim();
		tBody.appendChild(this.generalTemplate);
		tBody.appendChild(E('div', { 'style': 'margin-top:12px' },
			E('button', {
				'class': 'smb-btn',
				'click': function(ev) { ev.preventDefault(); self._saveTemplate(); }
			}, _('保存模板并重启 Samba'))
		));
		tmplCard.appendChild(tHead);
		tmplCard.appendChild(tBody);

		/* ================= 共享用户（账号密码） ================= */
		var userCard = E('div', { 'class': 'smb-card' });
		userCard.appendChild(E('div', { 'class': 'smb-card-topbar' }));
		userCard.appendChild(E('div', { 'class': 'smb-card-head', 'style': 'cursor:default' },
			_('共享用户（账号密码）')));
		var uBody = E('div', { 'style': 'padding:4px 18px 16px' });
		uBody.appendChild(E('div', { 'class': 'smb-hint', 'style': 'margin-bottom:8px' },
			_('共享选择「需要账号密码」时，将使用此处创建的账号登录。该账号与路由器管理密码无关；系统默认禁止 root 访问共享，请创建普通用户名。')));
		this.userListBox = E('div');
		uBody.appendChild(this.userListBox);

		var uName = E('input', { 'type': 'text', 'class': 'smb-input', 'placeholder': _('用户名，如 bob') });
		var uPass = E('input', { 'type': 'password', 'class': 'smb-input', 'placeholder': _('密码（至少5位）') });
		uBody.appendChild(E('div', { 'class': 'smb-user-add' }, [
			uName, uPass,
			E('button', {
				'class': 'smb-btn',
				'click': function(ev) { ev.preventDefault(); self._addSmbUser(uName, uPass); }
			}, '+ ' + _('添加用户'))
		]));
		uBody.appendChild(E('div', { 'class': 'smb-hint' },
			_('用户名规则：以字母开头，2~24位，只能包含字母、数字、点、下划线、连字符（不能纯数字）；密码至少 5 位。')));
		userCard.appendChild(uBody);

		/* ================= 共享列表 ================= */
		var listCard = E('div', { 'class': 'smb-card' });
		listCard.appendChild(E('div', { 'class': 'smb-card-topbar' }));
		listCard.appendChild(E('div', { 'class': 'smb-card-head', 'style': 'cursor:default' },
			_('共享目录列表')));

		this.listBody = E('div', { 'style': 'padding:4px 18px 16px' });
		listCard.appendChild(this.listBody);

		var addBtn = E('button', {
			'class': 'smb-btn smb-btn-lg',
			'style': 'margin:6px 0 4px',
			'click': function(ev) { ev.preventDefault(); self._openShareDialog(null); }
		}, '+ ' + _('添加共享'));
		listCard.appendChild(addBtn);

		container.appendChild(this.noticeBox);
		container.appendChild(generalCard);
		container.appendChild(userCard);
		container.appendChild(listCard);
		container.appendChild(tmplCard);

		/* 填充通用设置值 */
		var sections = uci.sections('samba4', 'samba');
		this.sambaSection = sections.length ? sections[0]['.name'] : null;
		if (this.sambaSection) {
			var sc = uci.get('samba4', this.sambaSection);
			this.generalWorkgroup.value = sc.workgroup || 'WORKGROUP';
			this.generalDescription.value = sc.description || '';
			this.generalAutoshare.checked = !(sc.autoshare === '0' || sc.autoshare === 'no');
			this.generalInterface.value = sc.interface || '';
			this.generalTuning.checked = (sc.enable_extra_tuning === '1' || sc.enable_extra_tuning === 'yes');
			this.generalSyncIo.checked = (sc.disable_async_io === '1' || sc.disable_async_io === 'yes');
			this.generalMacos.checked = (sc.macos === '1' || sc.macos === 'yes');
			this.generalLegacy.checked = (sc.allow_legacy_protocols === '1' || sc.allow_legacy_protocols === 'yes');
			if (this.generalNetbios)
				this.generalNetbios.checked = (sc.disable_netbios === '1' || sc.disable_netbios === 'yes');
			if (this.generalAdDc)
				this.generalAdDc.checked = (sc.disable_ad_dc === '1' || sc.disable_ad_dc === 'yes');
			if (this.generalWinbind)
				this.generalWinbind.checked = (sc.disable_winbind === '1' || sc.disable_winbind === 'yes');
		}

		this._renderShareList();
		this._loadUsers();
		return container;
	},

	/* ---------- 共享用户管理 ---------- */
	_smbUserCmd: function(op, user, pass) {
		var params = [op];
		if (user != null) params.push(user);
		if (pass != null) params.push(pass);
		return fs.exec('/usr/libexec/smb-usermgr.sh', params).then(function(res) {
			if (res && res.code !== undefined && res.code !== 0)
				return Promise.reject(new Error((res.stderr || res.stdout || '').trim() || ('命令执行失败 (code ' + res.code + ')')));
			return res;
		});
	},

	_loadUsers: function() {
		var self = this;
		return this._smbUserCmd('list').then(function(res) {
			var users = (res.stdout || '').split('\n').map(function(s) { return s.trim(); }).filter(function(s) {
				return s && s.indexOf(':') < 0 && s !== 'OK';
			});
			self._renderUsers(users);
		}).catch(function(err) {
			self.userListBox.innerHTML = '';
			self.userListBox.appendChild(E('div', { 'class': 'smb-hint' },
				_('无法读取用户列表') + '：' + (err.message || err)));
		});
	},

	_renderUsers: function(users) {
		var self = this;
		var box = this.userListBox;
		box.innerHTML = '';

		if (!users.length) {
			box.appendChild(E('div', { 'class': 'smb-empty', 'style': 'margin:10px 0;padding:16px' },
				_('还没有共享用户。添加后，共享就可以选择「需要账号密码」了。')));
			return;
		}

		users.forEach(function(u) {
			var row = E('div', { 'class': 'smb-user-row' });

			var renderNormal = function() {
				row.innerHTML = '';
				row.appendChild(E('span', { 'class': 'smb-username' }, u));
				row.appendChild(E('button', {
					'class': 'smb-btn smb-btn-sm smb-btn-plain',
					'click': function(ev) { ev.preventDefault(); renderEdit(); }
				}, _('修改密码')));
				row.appendChild(E('button', {
					'class': 'smb-btn smb-btn-sm smb-btn-danger',
					'click': function(ev) {
						ev.preventDefault();
						if (!window.confirm(_('确定删除用户') + ' ' + u + ' ？该用户将无法再访问共享。'))
							return;
						self._smbUserCmd('del', u).then(function() {
							self._loadUsers();
							self._notify(_('用户 %s 已删除').replace('%s', u));
						}).catch(function(e2) {
							window.alert(_('删除失败') + '：' + (e2.message || e2));
						});
					}
				}, _('删除')));
			};

			var renderEdit = function() {
				row.innerHTML = '';
				var pin = E('input', { 'type': 'password', 'class': 'smb-input', 'placeholder': _('输入新密码'), 'style': 'width:220px' });
				var err = E('span', { 'class': 'smb-mkdir-err' });
				row.appendChild(E('span', { 'style': 'font-weight:700;color:#3A3F51' }, u));
				row.appendChild(pin);
				row.appendChild(err);
				row.appendChild(E('button', {
					'class': 'smb-btn smb-btn-sm',
					'click': function(ev) {
						ev.preventDefault();
						var p = pin.value;
						if (!p) { err.textContent = _('请输入密码'); return; }
						self._smbUserCmd('chpass', u, p).then(function() {
							self._loadUsers();
							self._notify(_('用户 %s 的密码已更新').replace('%s', u));
						}).catch(function(e2) {
							err.textContent = self._smbErr(e2);
						});
					}
				}, _('保存')));
				row.appendChild(E('button', {
					'class': 'smb-btn smb-btn-sm smb-btn-plain',
					'click': function(ev) { ev.preventDefault(); renderNormal(); }
				}, _('取消')));
				pin.focus();
			};

			renderNormal();
			box.appendChild(row);
		});
	},

	_smbErr: function(err) {
		var msg = err.message || String(err || '');
		if (/too short/i.test(msg)) return _('用户名太短（至少2个字符）');
		if (/invalid user/i.test(msg) || /illegal/i.test(msg)) return _('用户名格式不合法：需以字母开头，只能包含字母、数字、点、下划线、连字符');
		if (/already exists/i.test(msg) || /exists/i.test(msg)) return _('该用户已存在，无需重复添加');
		if (/too short.*password|password.*short|shorter/i.test(msg)) return _('密码太短，至少 5 个字符');
		return msg;
	},

	_addSmbUser: function(uName, uPass) {
		var self = this;
		var name = uName.value.trim();
		var pass = uPass.value;
		if (!name) {
			window.alert(_('请输入用户名'));
			return;
		}
		if (/^[0-9]/.test(name)) {
			window.alert(_('用户名不能以数字开头（这是 Linux 系统用户的限制），请改为以字母开头，例如 u123'));
			return;
		}
		if (name.length < 2) {
			window.alert(_('用户名太短：至少需要 2 个字符'));
			return;
		}
		if (!/^[A-Za-z_][A-Za-z0-9._-]{1,23}$/.test(name)) {
			window.alert(_('用户名格式不正确：只能包含字母、数字、点、下划线、连字符，2~24 位'));
			return;
		}
		if (pass.length < 5) {
			window.alert(_('密码太短：至少需要 5 个字符'));
			return;
		}
		this._smbUserCmd('add', name, pass).then(function() {
			uName.value = '';
			uPass.value = '';
			self._notify(_('用户 %s 已创建，现在可以在共享中选择「需要账号密码」了').replace('%s', name));
			return self._loadUsers();
		}).catch(function(err) {
			window.alert(_('创建失败') + '：' + self._smbErr(err));
		});
	},

	_field: function(label, control) {
		return E('div', { 'class': 'smb-field' }, [
			E('label', {}, label),
			E('div', { 'class': 'smb-control' }, [control])
		]);
	},

	/* ---------- 共享列表渲染 ---------- */
	_renderShareList: function() {
		var self = this;
		var body = this.listBody;
		body.innerHTML = '';

		var shares = uci.sections('samba4', 'sambashare');
		if (!shares.length) {
			body.appendChild(E('div', { 'class': 'smb-empty' },
				_('还没有共享目录，点击下方「添加共享」开始吧。')));
			return;
		}

		var maskFileMap = { '0644': _('只读'), '0664': _('读写'), '0666': _('宽松'), '0777': _('完全') };
		var maskDirMap = { '0755': _('只读'), '0775': _('读写'), '0777': _('完全') };

		shares.forEach(function(sec, idx) {
			var sid = sec['.name'];
			var s = uci.get('samba4', sid);
			var readOnly = (s.read_only === '1' || s.read_only === 'yes');
			var browseable = !(s.browseable === '0' || s.browseable === 'no');
			var guestOk = (s.guest_ok === '1' || s.guest_ok === 'yes');
			var guestOnly = (s.guest_only === '1' || s.guest_only === 'yes');

			var permText = readOnly ? _('只读') : _('读写');
			var accessText = guestOnly ? _('仅游客') : (guestOk ? _('匿名') : _('账号密码'));
			var createMaskText = maskFileMap[s.create_mask] || (s.create_mask || '0664');
			var dirMaskText = maskDirMap[s.dir_mask] || (s.dir_mask || '0775');
			var usersText = (s.users || '').trim() ? s.users : _('所有');

			var table = E('table', { 'class': 'smb-share-table' });
			var thead = E('thead');
			var hr = E('tr');
			[ _('序号'), _('共享名称'), _('共享目录'), _('访问权限'), _('访问方式'), _('创建文件权限'), _('创建目录权限'), _('允许用户') ].forEach(function(h) {
				hr.appendChild(E('th', {}, h));
			});
			thead.appendChild(hr);
			table.appendChild(thead);

			var isAuto = (s.auto === '1');
			/* 注意: children 里不能放 null，E() 会把它渲染成 "null" 文本 */
			var nameKids = [ s.name || baseName(s.path || '') ];
			if (isAuto)
				nameKids.push(E('span', { 'class': 'smb-badge' }, _('U盘自动共享')));
			var nameCell = E('td', { 'style': 'font-weight:700;white-space:nowrap' }, nameKids);
			var dirKids = [ (s.path || '') ];
			if (isAuto && s.device)
				dirKids.push(E('span', { 'class': 'smb-badge', 'style': 'background:#F2F4F9;color:#7A81A0;margin-left:6px' }, s.device));
			var dirCell = E('td', {}, dirKids);

			table.appendChild(E('tbody', {}, E('tr', {}, [
				E('td', { 'class': 'smb-idx' }, String(idx + 1)),
				nameCell,
				dirCell,
				E('td', { 'style': 'white-space:nowrap' }, permText),
				E('td', { 'style': 'white-space:nowrap' }, accessText),
				E('td', { 'style': 'white-space:nowrap' }, createMaskText),
				E('td', { 'style': 'white-space:nowrap' }, dirMaskText),
				E('td', { 'style': 'white-space:nowrap' }, usersText)
			])));

			var card = E('div', { 'class': 'smb-share-scroll' }, [
				E('div', { 'class': 'smb-share-card' }, [
					table,
					E('div', { 'class': 'smb-share-actions' }, [
						E('button', {
							'class': 'smb-btn smb-btn-lg',
							'click': function(ev) { ev.preventDefault(); self._openShareDialog(sid); }
						}, _('编辑')),
						E('button', {
							'class': 'smb-btn smb-btn-danger smb-btn-lg',
							'click': function(ev) { ev.preventDefault(); self._deleteShare(sid); }
						}, _('删除'))
					])
				])
			]);
			body.appendChild(card);
		});
	},

	/* ---------- 单选选项卡组 ---------- */
	_radioValue: function(box) {
		var input = box.querySelector('input[type=radio]:checked');
		return input ? input.value : '';
	},

	_radioGroup: function(name, options, value, onChange) {
		var box = E('div', { 'class': 'smb-opts' });
		options.forEach(function(opt) {
			var input = E('input', { 'type': 'radio', 'name': name, 'value': opt.value });
			if (opt.value === value)
				input.checked = true;
			var label = E('label', { 'class': 'smb-opt' + (opt.value === value ? ' on' : '') }, [
				input, opt.title
			]);
			input.addEventListener('change', function() {
				var all = box.querySelectorAll('.smb-opt');
				for (var i = 0; i < all.length; i++)
					all[i].classList.remove('on');
				label.classList.add('on');
				if (onChange)
					onChange(opt.value);
			});
			box.appendChild(label);
		});
		return box;
	},

	_select: function(options, value) {
		var sel = E('select', { 'class': 'smb-input' });
		options.forEach(function(opt) {
			var op = E('option', { 'value': opt.value }, opt.title);
			if (opt.value === value)
				op.selected = true;
			sel.appendChild(op);
		});
		return sel;
	},

	/* ---------- 添加/编辑共享弹窗 ---------- */
	_openShareDialog: function(sid) {
		var self = this;
		var share = sid ? uci.get('samba4', sid) : null;

		var pathVal = share ? (share.path || '') : '';
		var nameVal = share ? (share.name || '') : '';
		var readOnly = share ? (share.read_only === '1' || share.read_only === 'yes') : false;
		var browseable = share ? !(share.browseable === '0' || share.browseable === 'no') : true;
		var guestOk = share ? (share.guest_ok === '1' || share.guest_ok === 'yes') : true;
		var guestOnly = share ? (share.guest_only === '1' || share.guest_only === 'yes') : false;
		var createMask = share ? (share.create_mask || '0664') : '0664';
		var dirMask = share ? (share.dir_mask || '0775') : '0775';
		var users = share ? (share.users || '') : '';
		var forceRoot = share ? (share.force_root === '1' || share.force_root === 'yes') : true;
		var inheritOwner = share ? (share.inherit_owner === '1' || share.inherit_owner === 'yes') : false;
		var timemachine = share ? (share.timemachine === '1' || share.timemachine === 'yes') : false;
		var tmSize = share ? (share.timemachine_maxsize || '') : '';

		/* 路径选择 */
		var pathInput = E('input', {
			'type': 'text', 'class': 'smb-input',
			'readonly': 'readonly',
			'placeholder': _('点击右侧「浏览」选择文件夹，无需手动输入'),
			'value': pathVal
		});
		var browseBtn = E('button', {
			'class': 'smb-btn',
			'style': 'margin-left:10px',
			'click': function(ev) {
				ev.preventDefault();
				self._openDirBrowser(function(path) {
					pathInput.value = path;
					if (!nameInput.value.trim())
						nameInput.value = baseName(path);
				});
			}
		}, _('📂 浏览…'));

		/* 名称 */
		var nameInput = E('input', {
			'type': 'text', 'class': 'smb-input',
			'value': nameVal,
			'placeholder': _('选择目录后自动生成，可修改')
		});

		/* 权限单选（联动回调晚绑定） */
		var permRadios = this._radioGroup('smb-perm', [
			{value: 'rw', title: _('读写')},
			{value: 'ro', title: _('只读')},
			{value: 'hidden', title: _('隐藏（不出现在共享列表）')}
		], readOnly ? 'ro' : (browseable ? 'rw' : 'hidden'), function(v) {
			if (syncPermUI) syncPermUI();
		});

		/* 访问方式单选（联动回调晚绑定） */
		var accessRadios = this._radioGroup('smb-access', [
			{value: 'anon', title: _('匿名访问（无需密码）')},
			{value: 'auth', title: _('需要账号密码')},
			{value: 'guestonly', title: _('仅游客可访问')}
		], guestOnly ? 'guestonly' : (guestOk ? 'anon' : 'auth'), function(v) {
			if (syncAccessUI) syncAccessUI();
		});

		/* 高级选项 */
		var maskFileSel = this._select([
			{value: '0644', title: _('只读 (0644)')},
			{value: '0664', title: _('读写 (0664)')},
			{value: '0666', title: _('读写-宽松 (0666)')},
			{value: '0777', title: _('完全访问 (0777)')}
		], createMask);
		var maskDirSel = this._select([
			{value: '0755', title: _('只读 (0755)')},
			{value: '0775', title: _('读写 (0775)')},
			{value: '0777', title: _('完全访问 (0777)')}
		], dirMask);
		var usersInput = E('input', {
			'type': 'text', 'class': 'smb-input',
			'value': users,
			'placeholder': _('留空表示所有用户')
		});
		var forceRootChk = E('input', { 'type': 'checkbox' });
		forceRootChk.checked = forceRoot;
		var inheritChk = E('input', { 'type': 'checkbox' });
		inheritChk.checked = inheritOwner;
		var tmChk = E('input', { 'type': 'checkbox' });
		tmChk.checked = timemachine;
		var tmSizeInput = E('input', {
			'type': 'text', 'class': 'smb-input',
			'style': 'width:110px',
			'value': tmSize,
			'placeholder': 'GB'
		});

		var advanced = E('details', { 'class': 'smb-adv' });
		advanced.appendChild(E('summary', {}, _('高级选项（默认不用动）')));
		var advBody = E('div');
		advBody.appendChild(this._field(_('创建文件权限'), maskFileSel));
		advBody.appendChild(this._field(_('创建目录权限'), maskDirSel));
		advBody.appendChild(this._field(_('允许的用户'), usersInput));
		advBody.appendChild(this._field(_('以 Root 强制写入'), E('label', { 'class': 'smb-chk' }, [
			forceRootChk, _('解决权限不足，共享内文件可被自由读写删除')
		])));
		advBody.appendChild(this._field(_('继承所有者'), E('label', { 'class': 'smb-chk' }, [
			inheritChk, _('新建文件归属目录所有者')
		])));
		advBody.appendChild(this._field(_('Apple 时间机器'), E('label', { 'class': 'smb-chk' }, [
			tmChk, _('作为Mac时间机器备份盘，大小(GB): '), tmSizeInput
		])));
		advanced.appendChild(advBody);

		/* ---- 联动锁定逻辑 ---- */
		var syncPermUI = function() {
			var ro = (self._radioValue(permRadios) === 'ro');
			/* 只读共享：写权限掩码无意义，锁定为只读掩码 */
			maskFileSel.disabled = ro;
			maskDirSel.disabled = ro;
			if (ro) {
				maskFileSel.value = '0644';
				maskDirSel.value = '0755';
			}
		};
		var syncAccessUI = function() {
			var v = self._radioValue(accessRadios);
			var guest = (v !== 'auth');
			/* 匿名/仅游客：账号列表无意义，锁定 */
			usersInput.disabled = guest;
			if (guest)
				usersInput.value = '';
			authHint.style.display = (v === 'auth') ? '' : 'none';
			guestHint.style.display = guest ? '' : 'none';
		};
		var authHint = E('div', { 'class': 'smb-hint', 'style': 'margin:-8px 0 10px' },
			_('「需要账号密码」使用页面上方「共享用户」中创建的账号登录（与路由器管理密码无关）'));
		var guestHint = E('div', { 'class': 'smb-hint', 'style': 'margin:-8px 0 10px' },
			_('匿名/游客模式不使用账号，下方「允许的用户」已自动锁定'));

		var content = E('div', {}, [
			this._field(_('共享目录 *'), E('div', { 'style': 'display:flex;align-items:center' }, [
				E('div', { 'style': 'flex:1;min-width:0' }, [pathInput]), browseBtn
			])),
			this._field(_('共享名称'), E('div', {}, [
				nameInput,
				E('div', { 'class': 'smb-hint' }, _('共享名称会显示在局域网设备上，建议用英文'))
			])),
			this._field(_('访问权限'), permRadios),
			this._field(_('访问方式'), accessRadios),
			authHint,
			guestHint,
			advanced
		]);

		syncPermUI();
		syncAccessUI();

		showModal(sid ? _('✏️ 编辑共享') : _('➕ 添加共享'), content, [
			E('button', {
				'class': 'smb-btn smb-btn-plain',
				'click': function(ev) { ev.preventDefault(); hideModal(); }
			}, _('取消')),
			E('button', {
				'class': 'smb-btn',
				'click': function(ev) {
					ev.preventDefault();
					self._saveShare(sid, pathInput.value, nameInput.value, permRadios, accessRadios, maskFileSel, maskDirSel, usersInput, forceRootChk, inheritChk, tmChk, tmSizeInput);
				}
			}, _('保存并生效'))
		]);
	},

	/* ---------- 目录浏览器 ---------- */
	_openDirBrowser: function(onPick) {
		var current = '/';
		var loadSeq = 0;
		var mountMap = {};
		var pathLabel = E('div', { 'class': 'smb-crumb' });
		var listBox = E('div', { 'class': 'smb-dirlist' });

		fs.read('/proc/mounts').then(function(res) {
			var text = (res && res.data != null) ? res.data : (typeof res === 'string' ? res : (res && res.result != null ? res.result : ''));
			text.split('\n').forEach(function(line) {
				var parts = line.split(' ');
				if (parts.length >= 3 && parts[0].indexOf('/') === 0) {
					var mp = parts[1].replace(/\\040/g, ' ');
					mountMap[mp] = { dev: parts[0], fstype: parts[2] };
				}
			});
			if (modalStack.length)
				load(current);
		}).catch(function() {});

		var deviceLabel = function(p) {
			var m = mountMap[p];
			if (!m) return '';
			if (m.dev.indexOf('/dev/sd') === 0) return _('外置硬盘/USB');
			if (m.dev.indexOf('/dev/mmcblk') === 0) return _('内置闪存');
			if (m.fstype === 'overlay' || m.dev === '/dev/root') return _('内置系统');
			return _('内置存储');
		};

		var appendGroupTitle = function(text) {
			listBox.appendChild(E('div', { 'class': 'smb-dir-group' }, text));
		};

		var appendEmpty = function(text) {
			listBox.appendChild(E('div', { 'class': 'smb-dir-empty' }, text));
		};

		var appendEntry = function(pathBase, e) {
			var fullPath = joinPath(pathBase, e.name);
			var tag = deviceLabel(fullPath);
			var kids = [
				E('span', {}, '📁'),
				E('span', { 'style': 'flex:1' }, e.name)
			];
			if (tag)
				kids.push(E('span', { 'class': 'smb-tag' }, tag));
			var item = E('div', { 'class': 'smb-dir-item' }, kids);
			item.addEventListener('click', function() { load(fullPath); });
			listBox.appendChild(item);
		};

		var updateCrumb = function(path) {
			pathLabel.innerHTML = '';
			pathLabel.appendChild(E('span', {}, _('当前路径：')));
			var parts = path === '/' ? [] : path.replace(/^\//, '').split('/');
			var acc = '';
			pathLabel.appendChild(E('b', {}, '/'));
			parts.forEach(function(p) {
				acc += '/' + p;
				pathLabel.appendChild(E('b', {}, p + (acc === path ? '' : ' / ')));
			});
		};

		/* 新建文件夹行 */
		var mkdirInput = E('input', {
			'type': 'text', 'class': 'smb-input',
			'placeholder': _('输入新文件夹名称')
		});
		var mkdirErr = E('span', { 'class': 'smb-mkdir-err' });
		var mkdirCreate = E('button', {
			'class': 'smb-btn smb-btn-sm',
			'click': function(ev) {
				ev.preventDefault();
				var name = mkdirInput.value.trim();
				mkdirErr.textContent = '';
				if (!name) {
					mkdirErr.textContent = _('请输入文件夹名称');
					return;
				}
				if (name === '.' || name === '..' || name.indexOf('/') >= 0 || name.indexOf('\\') >= 0) {
					mkdirErr.textContent = _('名称不能包含 / \\ 等字符');
					return;
				}
				mkdirCreate.disabled = true;
				fs.exec('/bin/mkdir', [ joinPath(current, name) ]).then(function() {
					mkdirCreate.disabled = false;
					mkdirRow.style.display = 'none';
					load(joinPath(current, name));
				}).catch(function() {
					mkdirCreate.disabled = false;
					mkdirErr.textContent = _('创建失败：可能已存在同名文件夹或当前目录不可写');
				});
			}
		}, _('创建'));
		var mkdirCancel = E('button', {
			'class': 'smb-btn smb-btn-sm smb-btn-plain',
			'click': function(ev) {
				ev.preventDefault();
				mkdirRow.style.display = 'none';
			}
		}, _('取消'));
		mkdirInput.addEventListener('keydown', function(ev) {
			if (ev.key === 'Enter') {
				ev.preventDefault();
				mkdirCreate.click();
			}
		});
		var mkdirRow = E('div', { 'class': 'smb-mkdir-row' }, [
			mkdirInput, mkdirCreate, mkdirCancel, mkdirErr
		]);

		var content = E('div', {}, [
			E('div', { 'class': 'smb-hint', 'style': 'margin-bottom:4px' },
				_('点击文件夹逐层进入；没有合适的目录时，可点左下角「新建文件夹」在当前位置创建')),
			pathLabel,
			mkdirRow,
			listBox
		]);

		var mkdirBtn = E('button', {
			'class': 'smb-btn smb-btn-sm smb-btn-plain',
			'style': 'margin-right:auto',
			'click': function(ev) {
				ev.preventDefault();
				mkdirRow.style.display = (mkdirRow.style.display === 'flex') ? 'none' : 'flex';
				mkdirErr.textContent = '';
				if (mkdirRow.style.display === 'flex') {
					mkdirInput.value = '';
					mkdirInput.focus();
				}
			}
		}, '＋ ' + _('新建文件夹'));

		var cancelBtn = E('button', {
			'class': 'smb-btn smb-btn-plain',
			'click': function(ev) { ev.preventDefault(); hideModal(); }
		}, _('取消'));
		var pickBtn = E('button', {
			'class': 'smb-btn',
			'click': function(ev) {
				ev.preventDefault();
				try {
					onPick(current);
				} catch (e) {
					if (window.console) console.error('samba4 pick error:', e);
				} finally {
					hideModal();
				}
			}
		}, _('✔ 选择此目录'));

		showModal(_('选择共享目录'), content, [mkdirBtn, cancelBtn, pickBtn]);

		var load = function(path) {
			var seq = ++loadSeq;
			current = path;
			updateCrumb(path);
			listBox.innerHTML = '';

			if (path !== '/') {
				var up = E('div', { 'class': 'smb-dir-item smb-up' }, [
					E('span', {}, '↩️'),
					_('返回上级')
				]);
				up.addEventListener('click', function() { load(dirName(path)); });
				listBox.appendChild(up);
			}

			fs.list(path).then(function(res) {
				if (seq !== loadSeq) return;
				var raw = (res && !Array.isArray(res) && res.entries != null) ? res.entries : res;
				var list = Array.isArray(raw) ? raw : Object.keys(raw || {}).map(function(name) {
					var st = raw[name] || {};
					return { name: name, type: st.type, size: st.size, mtime: st.mtime };
				});
				var entries = list.filter(function(e) {
					return e.type === 'directory' && e.name !== '.' && e.name !== '..';
				});
				entries.sort(function(a, b) {
					return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
				});
				if (!entries.length && path !== '/') {
					appendEmpty(_('此目录下没有子文件夹，可直接选择当前目录'));
				}
				if (path === '/') {
					/* 根目录：按物理设备区分——外置(U盘/移动硬盘)在前，内置(闪存/系统)在后 */
					var externList = [];
					var builtinMnt = [];
					Object.keys(mountMap).forEach(function(mp) {
						var m = mountMap[mp];
						var nm;
						if (mp.indexOf('/mnt/') === 0) {
							nm = mp.substring(5);
							if (nm && nm.indexOf('/') < 0) {
								if (m && m.dev.indexOf('/dev/sd') === 0)
									externList.push({ name: nm, type: 'directory' });
								else
									builtinMnt.push({ name: nm, type: 'directory' });
							}
						}
					});
					externList.sort(function(a, b) {
						return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
					});
					builtinMnt.sort(function(a, b) {
						return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
					});
					appendGroupTitle(_('外置存储（U盘/移动硬盘）'));
					if (externList.length) {
						externList.forEach(function(e) { appendEntry('/mnt', e); });
					} else if (builtinMnt.length) {
						appendEmpty(_('未检测到外置U盘/移动硬盘'));
					} else {
						var mntEntry = entries.filter(function(e) { return e.name === 'mnt'; })[0];
						if (mntEntry)
							appendEntry(path, mntEntry);
						else
							appendEmpty(_('未检测到外置存储设备'));
					}
					appendGroupTitle(_('内置存储（路由器闪存/系统）'));
					builtinMnt.forEach(function(e) { appendEntry('/mnt', e); });
					entries.filter(function(e) { return e.name !== 'mnt'; }).forEach(function(e) { appendEntry(path, e); });
				} else {
					entries.forEach(function(e) { appendEntry(path, e); });
				}
			}).catch(function(err) {
				listBox.innerHTML = '';
				listBox.appendChild(E('div', { 'class': 'smb-dir-empty' },
					_('无法访问该目录') + '：' + (err.message || _('无权限'))));
			});
		};
		load(current);
	},

	/* ---------- 保存/删除 ---------- */
	/* 统一的配置保存流程：无变更时不调用 apply（避免 ubus code 5 NO_DATA 报错） */
	_applyConfig: function() {
		return uci.save('samba4').then(function() {
			if (uci.changes)
				return uci.changes().then(function(changes) {
					var pending = true;
					try { pending = JSON.stringify(changes || {}).indexOf('samba4') >= 0; } catch (e) { pending = true; }
					return pending;
				});
			return true;
		}).then(function(pending) {
			if (!pending)
				return 'noop';
			return uci.apply(30).then(function() {
				return 'applied';
			}).catch(function(err) {
				/* ubus code 5 = NO_DATA：无实际变更，视为成功 */
				if (/code 5|未收到数据|NO_DATA/i.test(String((err && err.message) || err)))
					return 'noop';
				throw err;
			});
		});
	},

	_applyAndNotify: function(msg) {
		var self = this;
		return this._applyConfig().then(function(st) {
			var p = (st === 'noop') ? Promise.resolve() : L.resolveDefault(fs.exec('/etc/init.d/samba4', ['restart']), null);
			return p.then(function() {
				return uci.load('samba4');
			}).then(function() {
				self._renderShareList();
				self._notify(st === 'noop' ? _('配置没有变化，无需重新加载') : msg);
			});
		});
	},

	_saveShare: function(sid, pathVal, nameVal, permRadios, accessRadios, maskFileSel, maskDirSel, usersInput, forceRootChk, inheritChk, tmChk, tmSizeInput) {
		pathVal = (pathVal || '').trim();
		if (!pathVal) {
			window.alert(_('请先选择共享目录'));
			return;
		}

		var perm = '';
		var inputs = permRadios.querySelectorAll('input[type=radio]');
		for (var i = 0; i < inputs.length; i++)
			if (inputs[i].checked) { perm = inputs[i].value; break; }
		var access = '';
		inputs = accessRadios.querySelectorAll('input[type=radio]');
		for (var j = 0; j < inputs.length; j++)
			if (inputs[j].checked) { access = inputs[j].value; break; }

		var newSid = sid;
		if (!newSid)
			newSid = uci.add('samba4', 'sambashare');

		uci.set('samba4', newSid, 'path', pathVal);
		uci.set('samba4', newSid, 'name', (nameVal || '').trim() || baseName(pathVal));
		uci.set('samba4', newSid, 'read_only', perm === 'ro' ? '1' : '0');
		uci.set('samba4', newSid, 'browseable', perm === 'hidden' ? '0' : '1');
		uci.set('samba4', newSid, 'guest_ok', access === 'anon' ? '1' : '0');
		uci.set('samba4', newSid, 'guest_only', access === 'guestonly' ? '1' : '0');
		/* 只读共享强制只读掩码；匿名/游客模式不保存用户列表 */
		uci.set('samba4', newSid, 'create_mask', perm === 'ro' ? '0644' : maskFileSel.value);
		uci.set('samba4', newSid, 'dir_mask', perm === 'ro' ? '0755' : maskDirSel.value);
		var usersVal = (access === 'auth') ? usersInput.value.trim() : '';
		if (usersVal)
			uci.set('samba4', newSid, 'users', usersVal);
		else
			uci.set('samba4', newSid, 'users', null);
		uci.set('samba4', newSid, 'force_root', forceRootChk.checked ? '1' : '0');
		if (inheritChk.checked)
			uci.set('samba4', newSid, 'inherit_owner', 'yes');
		else
			uci.set('samba4', newSid, 'inherit_owner', null);
		uci.set('samba4', newSid, 'timemachine', tmChk.checked ? '1' : '0');
		if (tmChk.checked && tmSizeInput.value.trim())
			uci.set('samba4', newSid, 'timemachine_maxsize', tmSizeInput.value.trim());
		else
			uci.set('samba4', newSid, 'timemachine_maxsize', null);

		hideModal();
		this._applyAndNotify(_('已保存，Samba 服务已重新加载，局域网现在就能访问了')).catch(function(err) {
			window.alert(_('保存失败') + '：' + (err.message || err));
		});
	},

	_deleteShare: function(sid) {
		var s = uci.get('samba4', sid) || {};
		var msg = (s.auto === '1')
			? _('这是U盘/移动硬盘插入时自动生成的共享。确定删除吗？（拔掉设备后它也会自动消失）')
			: _('确定删除这个共享吗？删除后局域网将无法访问该目录。');
		if (!window.confirm(msg))
			return;
		uci.remove('samba4', sid);
		this._applyAndNotify(_('共享已删除')).catch(function(err) {
			window.alert(_('删除失败') + '：' + (err.message || err));
		});
	},

	_saveTemplate: function() {
		var self = this;
		var val = this.generalTemplate.value.trim().replace(/\r\n/g, '\n') + '\n';
		fs.write('/etc/samba/smb.conf.template', val).then(function() {
			return L.resolveDefault(fs.exec('/etc/init.d/samba4', ['restart']), null);
		}).then(function() {
			self._notify(_('配置模板已保存并重启 Samba 生效'));
		}).catch(function(err) {
			window.alert(_('模板保存失败') + '：' + (err.message || err));
		});
	},

	_saveGeneral: function() {
		var self = this;
		var sid = this.sambaSection;
		if (!sid)
			sid = uci.add('samba4', 'samba');
		uci.set('samba4', sid, 'workgroup', this.generalWorkgroup.value.trim() || 'WORKGROUP');
		uci.set('samba4', sid, 'description', this.generalDescription.value.trim());
		uci.set('samba4', sid, 'autoshare', this.generalAutoshare.checked ? '1' : '0');
		var iface = this.generalInterface.value.trim();
		uci.set('samba4', sid, 'interface', iface ? iface : null);
		uci.set('samba4', sid, 'enable_extra_tuning', this.generalTuning.checked ? '1' : '0');
		uci.set('samba4', sid, 'disable_async_io', this.generalSyncIo.checked ? '1' : '0');
		uci.set('samba4', sid, 'macos', this.generalMacos.checked ? '1' : '0');
		uci.set('samba4', sid, 'allow_legacy_protocols', this.generalLegacy.checked ? '1' : '0');
		if (this.generalNetbios)
			uci.set('samba4', sid, 'disable_netbios', this.generalNetbios.checked ? '1' : '0');
		if (this.generalAdDc)
			uci.set('samba4', sid, 'disable_ad_dc', this.generalAdDc.checked ? '1' : '0');
		if (this.generalWinbind)
			uci.set('samba4', sid, 'disable_winbind', this.generalWinbind.checked ? '1' : '0');
		var wantAuto = this.generalAutoshare.checked;
		this._applyConfig().then(function(st) {
			/* 开启→立即扫描已挂载存储补建自动共享；关闭→清理已生成的自动共享 */
			return L.resolveDefault(fs.exec('/usr/libexec/smb-usermgr.sh',
				[ wantAuto ? 'autoscan' : 'autoclean' ]), null).then(function(res) {
				return L.resolveDefault(fs.exec('/etc/init.d/samba4', ['restart']), null).then(function() {
					return uci.load('samba4');
				}).then(function() {
					self._renderShareList();
					if (st === 'noop' && !wantAuto) {
						self._notify(_('设置没有变化，无需重新加载'));
						return;
					}
					var n = (((res && res.stdout) || '').match(/ADDED/g) || []).length;
					if (wantAuto)
						self._notify(n > 0
							? _('通用设置已保存，已为当前挂载的U盘/移动硬盘生成 ' + n + ' 个自动共享（见下方列表）')
							: _('通用设置已保存，当前挂载的存储已全部有共享覆盖'));
					else
						self._notify(_('通用设置已保存，自动共享已关闭并清理自动共享条目'));
				});
			});
		}).catch(function(err) {
			window.alert(_('保存失败') + '：' + (err.message || err));
		});
	},

	_notify: function(msg) {
		var box = this.noticeBox;
		box.textContent = '✔ ' + msg;
		box.className = 'smb-alert ok';
		box.style.display = 'block';
		clearTimeout(this._noticeTimer);
		this._noticeTimer = setTimeout(function() {
			box.style.display = 'none';
		}, 4000);
	}
});
