var fup = new function()
{
	var obj = $i();
	var num=0;//上传的文件序号
	var isFileOk =0;//上传成功的个数,文件正在上传中 1 文件已经上传完毕
	//var newNode;
	//this.res={};//暂时无用
	this.list = new NMap();//html5对应的序号与文件对应关系Map
	this.files = new NMap();//html5对应的序号与文件对应关系Map
	var timeoutFlag = "";// 系统超时标识符
	var uploadRes = {};// 文件上传后，返回的信息，
	var keyNum = {};//为json格式，请使用 key num 两个key值
	var updDiv = "#upload_div";//文件上传组件 按钮或者拖拽区域的id
	this.url;//文件上传后台链接
	this.formId;
	var ieIng = false;//用于区别ie中是否有文件在上传
	this.limit=10485760;//上传附件的大小限制
	var delFnc="";//删除文件时调用的接口(默认只有一个参数哦，就是文件名)
	var realBody="";//整个网页的body部分，或者说是整个网页可见区域
	/*
	 * 初始化文件上传组件
	 * rbody 为 document.body 相类似的一个参数,整个网页的body部分，或者说是整个网页可见区域
	 * uurl:form提交的action
	 * flim:文件大小的限制
	 * id:div 的id
	 * inputId:form中input的id前面要带有#号
	 * formId:form的id
	 * dfn : 上传文件成功后，删除文件时调用的函数，默认只有一个参数哦，就是文件名
	*/
	this.init=function(rbody,uurl,flim,id,inputId,formId,dfn)
	{
		isFileOk = 0;
		fup.setKeyNum({});
		fup.setUploadRes({});
		this.url = uurl;
		this.limit = flim;
		this.$i(id);
		this.formId = formId;
		realBody = rbody;
		delFnc = dfn; 
		try{
			fup.addListener();
			fup.fileInput = $(inputId).get(0);
			//fup.fileInput.addEventListener("change", function(e) { fup.funGetFiles(e); }, false);
		}catch(e){}
			//fup.url=$("#upd_file").attr("action");
	};
	/*保存 按钮或者拖拽区域的id
	 * a 一个div的id
	*/
	this.setUpdDiv = function(a){
		updDiv = a;
	};
	/*获取 按钮或者拖拽区域的id */
	this.getUpdDiv=function()
	{
		return updDiv;
	};
	/*保存文件上传后的返回信息
	 * a 服务器返回的信息
	*/
	this.setUploadRes = function(a){
		uploadRes = a;
	};
	/*获取文件上传后的返回信息*/
	this.getUploadRes = function(){
		return uploadRes;
	};
	/* 保存文件上传后的附加信息
	 * obj 为json 格式，包含key num 两个key值
	*/
	this.setKeyNum = function(obj){
		keyNum = obj;
	};
	/*获取文件上传后的附加信息*/
	this.getKeyNum = function(){
		return keyNum;
	};
	this.setFileOk=function()
	{
		isFileOk++;
	};
	/* 文件上传后，返回前端，如果操作成功，则需要调用此方法，进行必要参数设置 */
	this.setUF=function(num,key,org,name,size)
	{
		fup.prog100(key);
		fup.list.remove(key);
		fup.files.put(num,[org,name,size]);
		fup.setFileOk();
	};
	/*设置系统超时标识（暂不使用）
	 * a 服务器返回的信息
	*/
	this.setTimeoutFlag=function(a)
	{
		timeoutFlag = a;
	};
	/*（暂不使用）*/
	this.timeout=function(a,tip)
	{
		if(!a || a == timeoutFlag)
		{
			//请您重新登录后，再进行相关操作
			alert(tip);
			return;
		}
	};
	this.getFileUploadStatus=function()//返回文件上传的状态
	{
		var a = this.files.getSize();
		return [a,isFileOk];
	};
	this.$i=function(id)
	{
		obj = document.getElementById(id);
		return obj;
	};
	this.detectDragable = function()//检测浏览器是否支持拖拽上传
	{
		return !!window.FileReader;
	};
	this.addListener=function()//添加监听事件
	{
		//obj.addEventListener("drag",this.drag(this),false);
		obj.addEventListener("drop",function(e){
			$('body').css({'cursor':'default'});
			// 获取文件列表对象
			var files = e.target.files || e.dataTransfer.files;
			fup.getFiles(files);
			fup.handleFiles(e.dataTransfer.files,e);
			e.preventDefault();
			//e.stopPropagation();
		},false);
		
		obj.addEventListener("dragenter",function(e){
			$('body').css({'cursor':'not-allowed'});
			//e.stopPropagation();
			e.preventDefault();
			 $('body').css({'cursor':'not-allowed'});
		},false);
		obj.addEventListener("dragleave", function(e){  
			obj.style.borderColor = '#828282';  
			$('body').css({'cursor':'not-allowed'});
			e.preventDefault();
			//e.stopPropagation();
		}, false); 

		obj.addEventListener("dragover",function(e){
			//e.stopPropagation();
			$('body').css({'cursor':'not-allowed'});
			e.preventDefault();
		},false);
		/* 为 body 添加禁用事件 */
		if(realBody)
		{
			realBody.addEventListener("dragenter",function(e){
				$('body').css({'cursor':'not-allowed'});
				e.preventDefault();
			},false);
			realBody.addEventListener("dragover",function(e){
				$('body').css({'cursor':'not-allowed'});
				e.preventDefault();
			},false);
			realBody.addEventListener("drop",function(e){
				$('body').css({'cursor':'default'});
			},false);
			realBody.addEventListener("dragleave",function(e){
				$('body').css({'cursor':'default'});
			},false);
		}
	};
	this.getFiles = function(files)
	{
		 return this;
	};
	this.handleFiles=function(files,e)
	{
		var len = !files ?0:files.length;
		if (len === 0) {return;};
		//var temp = obj.innerHTML;
		for(var a = 0;a<len;a++)
		{
			num++;
			var cont = "";//只读属性，文件名
			cont+=files[a].name;
			cont+=" ( ";
			//cont+=Math.round(files[0].size/1024) +"KB";//只读特性，数据的字节数  
			var fileSize = files[a].size;
			 if (fileSize > 1024 * 1024)
			  fileSize = (Math.round(fileSize * 100 /(1024 * 1024))/100).toString() + 'MB';
			 else
			  fileSize = (Math.round(fileSize * 100/1024)/100).toString() + 'KB';
			cont+=fileSize;
			cont+=" )";
			//this.res[num] = num;
			this.list.put(num,files[a]);
			//this.files.put(num,files[a]);
			if(num == 1)
			{
				//$("#upload_div").html("");
				$("#upload_div").append(this.getcont(cont,num));
			}
			if(num > 1){
				$("#upload_div").append(this.getcont(cont,num));
			}
			//size lastModifiedDate fileSize name type webkitRelativePath fileName webkitSlice
		}
		this.upload();
	};
	this.getUploadList=function(a)//获取上传文件的列表
	{
		//if(!a)
			return $("#upload_div").html();
		/*else
		{
			
				1、文件序号
				2、原文件名称
				3、新文件名称
				4、非ie file对象
			
			//this.list.remove(num);
			//fup.files.remove(num);
			//fup.files.put(num,[o.org,o.name]);
			//this.list.put(num,files[a]);
			return "";
		}*/
	};
	this.setUploadList=function(a)
	{
		$("#upload_div").html(a);
	};
	this.isie=function()
	{
		return /msie/.test(navigator.userAgent.toLowerCase());
	};
	this.getcont=function(cont,num)//文件名称,文件序号
	{
		//alert("cont:"+cont);
		var temp = "<div id='aa"+num+"' style='width:98%;height:32px;line-height:32px;'><ul style='float:right;width:40px;height:32px;line-height:32px;cursor:pointer;' onclick='fup.delItem("+num+");'>删除</ul>";
		if(!this.isie())
		{
			temp+="<ul style='float:right;width:60px;height:32px;line-height:32px;' id='pro_"+num+"'>0.0%</ul>";
		}
		else
		{
			temp+="<ul style='float:right;width:60px;height:32px;line-height:32px;' id='pro_"+num+"'>正在上传...</ul>";
		}
		temp+="<ul style='float:left;width:350px;height:32px;line-height:32px;padding-left:20px;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'>"+cont+"</ul></div>";
		return temp;
	};
	this.delItem=function(num)
	{
		//$("#num_temp").remove
		var my = this.$i("aa"+(num));
		if (my)
		{
			my.parentNode.removeChild(my);
			var fn = fup.files.get(num)[1];
			
			this.list.remove(num);
			fup.files.remove(num);
			if(isFileOk>0)
				isFileOk--;
			 var func = eval(delFnc);
			 if(typeof func == 'function'){
				func.call(func,decodeURIComponent(fn));
			 }
		}
	};
	this.prog=function(i,a,b)
	{
		var res = (a / b * 100).toFixed(2) + '%';
		if(res == '100.00%')res = '99.99%';
		$("#pro_"+i).html(res);
	};
	this.prog100=function(key)
	{
		$("#pro_"+key).html("100.00%");
	};
	this.upload=function()//HTML5 文件上传
	{
		 var keys = (this.list).keys();
		 var len = !keys?0:keys.length;
		 for (var i = 0; i < len; i++) 
		 {
			 var file = (this.list).get(keys[i]+"");
			 if(file.fileSize>this.limit)
			 {
				alert("文件：" + file.name + " 大小超过限制！");
				return;
			 }
			(function(file,key){
				var xhr = new XMLHttpRequest();
				if (xhr.upload) 
				{
					xhr.upload.addEventListener("progress", function(e) {
						fup.prog(key,e.loaded, e.total);
					}, false);
					// 文件上传成功或是失败
					xhr.onreadystatechange = function(e) {
						if (xhr.readyState == 4) {
							//alert(xhr.status);
							if (xhr.status == 200) {
								var data = $.trim(xhr.responseText);
								//alert(data);
								//上传状态，原始文件名，新文件名及路径
								if(data)
								{
									eval("var o = "+data);
									fup.setUF(num,key,o.org,o.name,o.size);
								}else
								{
									fup.setKeyNum({});
								}
								fup.setUploadRes(data);
								
							} else {
								alert("网络超时，文件上传失败!");
							}
						}
					};
					//size lastModifiedDate fileSize name type webkitRelativePath fileName webkitSlice
					// 开始上传
					//alert(window.FormData);
					xhr.contentType ="application/x-www-form-urlencoded; charset=utf-8"; 
					xhr.open("POST", fup.url, true);
					xhr.setRequestHeader("X_FILENAME", encodeURIComponent(file.name));
					xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
					var fd = new FormData();
					fd.append('file',file);
					xhr.send(fd);
				}
				else
				{
					alert("! xhr.upload ...");
				}
			})(file,keys[i]);
		 }
	};
	this.chieIng=function()
	{
		ieIng = false;
		if($("#fileImage").val())
		{
			ieIng = true;
		}
	};
	this.fname=function(id)
	{
		var fname = $("#fileImage").val();
		var idx = fname.lastIndexOf("\\");
		var pos1 = fname.lastIndexOf('/');
		var pos = Math.max(idx,pos1);
		if(pos == -1)
		{
			return '';
		}
		return fname.substring(pos+1);
		//return fname.match(/[^\/]*$/)[0];
	};
	this.append=function(a)
	{
	   $("#upload_div").append(a);
	};
	this.ieUpload=function()
	{
		if(ieIng){
			alert("当前文件正在上传，请稍候，谢谢！");
			return;
		}
		this.chieIng();
		//var a = fup.url;
		var fname = this.fname("fileImage");
		num++;
		$("#upload_div").append(fup.getcont(fname,num));
		$.ajaxFileUpload({
				//需要链接到服务器地址
				url:fup.url+"?fhd="+decodeURIComponent(fname),
				//url:a+'?r='+Math.random(),
				secureuri:false,
				formID:fup.formId,
				//fileElementId:'fileImage',  
				dataType: 'text',  //服务器返回的格式，可以是json
				success: function (data, status)  //相当于java中try语句块的用法
				{ 
					//data = data.trim();
					data = $.trim(data);
					eval("var o = "+data);
					//1、成功，-1、未知错误 -2、上传失败,-3、文件大小超过限制
					//alert("上传返回："+[data,status]);
					
					if(o&& o.rd == '1')
					{
						$("#pro_"+num).html("100.00%");
						
						//(fup.list).put(num,[o.org,o.name]);
						//fup.files.put(num,[o.org,o.name]);
						fup.setUF(num,num,o.org,o.name,o.size);
						//isFileOk++;
						var afile = $("#fileImage");
						afile.after(afile.clone().val(""));
						afile.remove();
						fup.chieIng();
						/*
						if(data)
						{
							eval("var o = "+data);
							fup.setUF(num,key,o.org,o.name,o.size);
						}else
						{
							fup.setKeyNum({});
						}
						fup.setUploadRes(data);
						*/
					}
					else
					{
						$("#pro_"+num).html("上传失败");
						fup.setKeyNum({});
					}
					fup.setUploadRes(data);
				},
				error: function (data, status, e) //相当于java中catch语句块的用法
				{
					alert("网络超时，文件上传失败!");
				}
			}
		);
	};
};
function NMap()
{
	this.eles={};
	this.size=0;
	this.put = function(key,val)
	{
		this.size++;
		this.eles[""+key] = val;
	};
	this.get = function(key)
	{
		return this.eles[""+key];
	};
	this.remove = function(key)
	{
		var flag = delete this.eles[key];
		if(flag && this.size >=1)
		{
			this.size--;
		}
	};
	this.keys = function()
	{
		var cont=[];
		for(var a in this.eles)
		{
			cont[cont.length] = a;
		}
		return cont;
	};
	this.getSize=function()
	{
		return this.size;
	};
};