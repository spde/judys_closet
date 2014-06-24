//Define global variables

	//Variable containing an array of objects and their data
		var objects = {};

	//Variable containing an array of object IDs
		var object_list = new Array();

	//Variable containing two arrays of AJAX request trackers
		var ongoing_requests = new Array(Array(), Array());

	//Variable containing an array of page data
		var pages_data = new Array();

	//Variable containing sorting order
		var sorting_order = new Array();

	//Database version
		var database_ver = 0.2;

	//Available languages
		var available_languages = [{code: "se", lable: "Svenska"}, {code: "en", lable: "English"}];

	//Define empty language object
		var language = {};

//Initiate new Lawnchair object
	var store = new Lawnchair({
		adapter: "dom",
		name: "bomobil_db"
		},
		function(store){});
tempval = null;

API_URL = "http://46.16.233.117/judys_closet/api.php";

item_list = [];
image_list = [];

item_page_number_array = [1, 2, 3];
active_item_page_number = 2;


function isPhoneGap(){
	if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)){
		return true;
		}
	return false;
	}

function clearLawnchair(){
	store.nuke();
	}

function setLawnchair(key, object){
	store.save({key: key, value: object});
	}

function getLawnchair(key){
	temp = null;
	store.exists(key, function(exists){
		if (exists == true){
			store.get(key, function(result){
				temp = result.value;
				});
			}
		});
	return temp;
	}

function removeLawnchair(key){
	store.exists(key, function(exists){
		if (exists == true){
			store.remove(key, function(){});
			}
		});
	}

function lengthLawnchair(){
	length = 0;
	store.keys(function(result){
		length = result.length;
		});
	return length;
	}

function keysLawnchair(){
	keys = Array();
	store.keys(function(result){
		keys = result;
		});
	}

function keyLawnchair(index){
	key = null;
	store.keys(function(result){
		key = result[index];
		});
	return key;
	}

function processPageData(x, page_number){
	return function (returnData){
		//Add page html to array
			pages_data.push(returnData);
		
		//Finish tracking of page AJAX req
			ongoing_requests[0][(x-2)] = false;

		//Update progress
			updateProgress(5+((x-1)/page_number)*10);

		//Check if there are any remaining page requests
			checkPageFetchCompletion();
		}
	}

function checkPageFetchCompletion(){
	
	//Count how many page requests have been completed
		var count = 0;
		for (y = 0; y < ongoing_requests[0].length; y++){
			if (ongoing_requests[0][y] == false){
				count++;
				}
			}

	//Update progress bar
		value = (count / ongoing_requests[0].length) * 15 + 5;
		updateProgress(value);

	//Update loading texts
		$("#page_count").text(count+" / "+ongoing_requests[0].length);

	//If all pages have been fetched, proceed to process objects
		if (count == ongoing_requests[0].length){
			processPages();
			}
	}

function fetchPages(){
	
	//Track initial AJAX req
		ongoing_requests[0][0] = true;
	
	//Initiate initial AJAX req (first page)
		$.ajax({
			type: "GET",
			url: "http://www.boplats.se/HSS/Object/object_list.aspx?cmguid=4e6e781e-5257-403e-b09d-7efc8edb0ac8&objectgroup=1",
			dataType: 'html',
			cache: true,

			success: function(returnData){
				updateProgress(5);
				
				//Place data in array
					pages_data[0] = returnData;

				//Fetch additional pages (if applicable)
					page_number = $(returnData).find("span[id=ucNavigationBarSimple_lblNoOfPages]").html().split(" ")[1].split("/");
					page_number = parseInt(page_number[1]);
					i = 2;
					if (page_number > 1){
						for (i = 2; i <= page_number; i++){
							ongoing_requests[0][(i-2)] = true;
							var data = {
								'__EVENTVALIDATION': "/wEWJAKno/nlBwKlwZm8CwKBtOJ/Aq7x3JgDAr3p8rMGAr3p9rMGAr3p6rMGAr3pgrQGAr3phrQGAvDC6boLAsHIjPcNAozF08gNAs3G0Z4EAtj1w90NAqGKwJMJAuLBoJwKApa34usLAom5/K8LAoi3o/cLAtuygvkLAtry0fgLAt30i64LAtzy2q0LAt/ymq8LAsCbzvgLAuSg4vgIAtH23pgMAuXRk/YBAsylk6wMAsyll6wMAsylm6wMAsyl/6sMAsylg6wMAsylh6wMAsyli6wMAsylr6wM0oQogMiWnsp3PFAJXx3P9dzDRXY=",
								'__VIEWSTATE': "/wEPDwULLTEwMTU2MDEzOTYPZBYCZg9kFh4CAQ9kFhJmDw8WBB4EVGV4dAUKSW4gRW5nbGlzaB4LTmF2aWdhdGVVcmwFIS9sYW5nL2NoYW5nZV9sYW5nLmFzcHg/bGFuZz1lbi1VU2RkAgEPDxYEHwAFCFNpdGUgTWFwHwEFES9DTS9zaXRlX21hcC5hc3B4ZGQCAg8PFgQfAAUHQ29va2llcx8BBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD1hYWYzOGYwNy1hMWE0LTQ3NjUtOTMxZS02OGRiMjQ1MzA3ZGNkZAIDDw8WBB8ABQVQcmVzcx8BBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD04ZGJhMjg2Mi0wNTg3LTRlZmItOGMwOC02MWUwOGI2MWFhZmVkZAIEDw8WBB8ABQlUeWNrIHRpbGwfAQUWL2NvbnRhY3QvZmVlZGJhY2suYXNweGRkAgcPDxYCHgdUb29sVGlwBStBbmdlIHPDtmt1dHRyeWNrIG9jaCBrbGlja2EgcMOlIDxiPlPDtms8L2I+ZGQCCQ8WAh4FdmFsdWUFBFPDtmtkAgwPFgQfAwUITG9nZ2EgaW4eB29uY2xpY2sFUWphdmFzY3JpcHQ6d2luZG93LmxvY2F0aW9uLmhyZWY9Jy91c2VyL2xvZ2luX2hzLmFzcHg/UmV0dXJuVXJsPS9IU1MvRGVmYXVsdC5hc3B4J2QCEQ8PFgQfAAURUmVnaXN0cmVyYSBkaWcgLT4fAQUXL0hTUy9Vc2VyL3JlZ2lzdGVyLmFzcHhkZAICD2QWAmYPZBYCZg88KwAJAQAPFgQeCERhdGFLZXlzFgAeC18hSXRlbUNvdW50AgpkFhRmD2QWAgIBDxYEHgRocmVmBTkvRGVmYXVsdC5hc3B4P2NtZ3VpZD1iYzRhZTNmMy0yOWU0LTQxOTgtODA0Ni1iOTU2MzM4ZmFmOTEeBnRhcmdldGQWAmYPFQEDSGVtZAIBD2QWAgIBDxYEHwcFTi9DTS9UZW1wbGF0ZXMvQXJ0aWNsZS9nZW5lcmFsLmFzcHg/Y21ndWlkPWVlODJmNmU5LWZjYTYtNDU2YS1hNjk3LTAwOTA5NmMzNmUwMR8IZBYCZg8VAQpPbSBCb3BsYXRzZAICD2QWAgIBDxYEHwcFPS9IU1MvRGVmYXVsdC5hc3B4P2NtZ3VpZD1kZWU5YjE2ZC03YjMwLTQ3MGQtYTgwYS01MDg1N2U0YzBjNjEfCGQWAmYPFQEOU8O2ayBsw6RnZW5oZXRkAgMPZBYCAgEPFgQfBwVML0hTTS9FeGNoYW5nZU9iamVjdC9kZWZhdWx0LmFzcHg/Y21ndWlkPTRmNWU1OWI3LTI2ZmMtNDFkMS04YmEzLThiMzhhNzc5OTFlOB8IZBYCZg8VAQxCeXRlc2LDtnJzZW5kAgQPZBYCAgEPFgQfBwVUL0hTTS9TdWJsZXRPYmplY3QvZGVmYXVsdC5hc3B4P2NtZ3VpZD04YzYxYjQ5Zi02NDEzLTRhYzMtOTc1ZS04MWViMzRmNjk2MGMmc3VvdHlwZT0xHwhkFgJmDxUBCUFuZHJhaGFuZGQCBQ9kFgICAQ8WBB8HBUsvSFNTL09iamVjdFByaXZhdGUvZGVmYXVsdC5hc3B4P2NtZ3VpZD00MzdmNzFhNC00NGMyLTQ0MmEtOGViZS1jZDRkMjU4YTVlOTkfCGQWAmYPFQEJS8O2cCBueXR0ZAIGD2QWAgIBDxYEHwcFTi9DTS9UZW1wbGF0ZXMvQXJ0aWNsZS9nZW5lcmFsLmFzcHg/Y21ndWlkPWZkZDc2MjcwLWI3ODAtNGQxYS05OWUwLWNjNWI1Zjc3NWE0MR8IZBYCZg8VAQZTZW5pb3JkAgcPZBYCAgEPFgQfBwVOL0NNL1RlbXBsYXRlcy9BcnRpY2xlL2dlbmVyYWwuYXNweD9jbWd1aWQ9ODRiMDc5NzYtMDZlNy00MzRmLWI1ZjEtMTY5NzM1NWQ2NDVhHwhkFgJmDxUBBlVuZ2RvbWQCCA9kFgICAQ8WBB8HBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD00ZmEyOTI4MS0yZjkzLTQyM2QtYmM3My1jMjdiYWJiNTU1ZmMfCGQWAmYPFQEHU3R1ZGVudGQCCQ9kFgICAQ8WBB8HBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD02ZjI1ZDUzYS02OGJhLTQ3ZTQtOTI0Ni0zYTJlZGRhZjYzODcfCGQWAmYPFQEKSHlyZXN2w6RyZGQCBA9kFgICAQ88KwAJAQAPFgQfBRYAHwYCDGQWGGYPZBYCAgEPFgQfCGQfBwVdL3VzZXIvbG9naW5faHMuYXNweD9jbWd1aWQ9ZDc1NjQyNzktYjE3Ni00ZjEzLTkxNzQtM2ZjNmU0NzlhOWE0JlJldHVyblVSTD0uLi9IU1MvRGVmYXVsdC5hc3B4FgQCAQ8PFgQeCEltYWdlVXJsBR0vaW1nL2ljb19hcnJvd19tZW51ZXhwYW5kLmdpZh4HVmlzaWJsZWhkZAICDxUBCExvZ2dhIGluZAIBD2QWAgIBDxYEHwhkHwcFTi9DTS9UZW1wbGF0ZXMvQXJ0aWNsZS9nZW5lcmFsLmFzcHg/Y21ndWlkPTQ1NjFkNjZlLWU5YzYtNDM3OC1iOTlhLTk2ZTcyMjBhNjQzNRYEAgEPDxYEHwkFHS9pbWcvaWNvX2Fycm93X21lbnVleHBhbmQuZ2lmHwpoZGQCAg8VARVQZXJzb251cHBnaWZ0ZXIgKFB1TClkAgIPZBYCAgEPFgQfCGQfBwVDL0hTUy9Vc2VyL3JlZ2lzdGVyLmFzcHg/Y21ndWlkPWE5MGVmZmUzLTFkYWEtNDM2NC1iMmQxLThmODQwODdhNjk0ORYEAgEPDxYEHwkFHS9pbWcvaWNvX2Fycm93X21lbnVleHBhbmQuZ2lmHwpoZGQCAg8VAQ5SZWdpc3RyZXJhIGRpZ2QCAw9kFgICAQ8WBh8IZB8HBVYvSFNTL09iamVjdC9vYmplY3RfbGlzdC5hc3B4P2NtZ3VpZD00ZTZlNzgxZS01MjU3LTQwM2UtYjA5ZC03ZWZjOGVkYjBhYzgmb2JqZWN0Z3JvdXA9MR4Fc3R5bGUFGWJhY2tncm91bmQtY29sb3I6IzBBNDk5NzsWBAIBDw8WBB8JBR0vaW1nL2ljb19hcnJvd19tZW51ZXhwYW5kLmdpZh8KaGRkAgIPFQEYTMOkZ2VuaGV0ZXI6IGFsbGEgbGVkaWdhZAIED2QWAgIBDxYEHwhkHwcFZS9IU1MvT2JqZWN0L29iamVjdF9saXN0LmFzcHg/Y21ndWlkPTE0ODlmNDQ4LWY2MmItNDk1MC04MDE5LWIxNDgwNTE1ZmE1NSZvYmplY3Rncm91cD0xJmFjdGlvbj1ob3RsaXN0FgQCAQ8PFgQfCQUdL2ltZy9pY29fYXJyb3dfbWVudWV4cGFuZC5naWYfCmhkZAICDxUBFkzDpGdlbmhldGVyOiBueWlua29tbmFkAgUPZBYCAgEPFgQfCGQfBwVKL0hTUy9PYmplY3Qvb2JqZWN0X3NlYXJjaC5hc3B4P2NtZ3VpZD1iNDY0NjZiZS03OTcxLTQyZGUtYWQxMy04NDNkOWUwODk5YjgWBAIBDw8WBB8JBR0vaW1nL2ljb19hcnJvd19tZW51ZXhwYW5kLmdpZh8KaGRkAgIPFQEUTMOkZ2VuaGV0ZXI6IHNvcnRlcmFkAgYPZBYCAgEPFgQfCGQfBwVOL0NNL1RlbXBsYXRlcy9BcnRpY2xlL2dlbmVyYWwuYXNweD9jbWd1aWQ9ZDZjZjJjYjYtOGQzYS00ZjcxLTkyY2MtOTQ1NjQ4YzhlMmEyFgQCAQ8PFgQfCQUdL2ltZy9pY29fYXJyb3dfbWVudWV4cGFuZC5naWYfCmhkZAICDxUBGFPDpSBzw7ZrZXIgZHUgaHlyZXNyw6R0dGQCBw9kFgICAQ8WBB8IZB8HBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD1mYjEwMTdjMC1iMDY2LTQxYjQtYmZmMy0xNDk4MWI3NTM1YTYWBAIBDw8WBB8JBR0vaW1nL2ljb19hcnJvd19tZW51ZXhwYW5kLmdpZh8KaGRkAgIPFQEIT21yw6VkZW5kAggPZBYCAgEPFgQfCGQfBwVOL0NNL1RlbXBsYXRlcy9BcnRpY2xlL2dlbmVyYWwuYXNweD9jbWd1aWQ9YmIwOWMzNDMtYjhhMC00NmFjLTk5NGUtN2ZhYzYwNjhmNDA2FgQCAQ8PFgQfCQUdL2ltZy9pY29fYXJyb3dfbWVudWV4cGFuZC5naWYfCmhkZAICDxUBFlRpcHMgZsO2ciBkZW4gc8O2a2FuZGVkAgkPZBYCAgEPFgQfCGQfBwVIL0hTUy9Vc2VyL3NlbmRfcGFzc3dvcmQuYXNweD9jbWd1aWQ9ZTlkODcxNWQtYjYwYy00ZGU1LTkwOTAtZGY2YTc1MGM3ZjgxFgQCAQ8PFgQfCQUdL2ltZy9pY29fYXJyb3dfbWVudWV4cGFuZC5naWYfCmhkZAICDxUBDkdsw7ZtdCBQSU4ta29kZAIKD2QWAgIBDxYEHwhkHwcFTi9DTS9UZW1wbGF0ZXMvQXJ0aWNsZS9nZW5lcmFsLmFzcHg/Y21ndWlkPTg4OTM1MTQ3LTQwODQtNGEwOC1iM2ExLTQ4M2I1ZjNmNTk4MxYEAgEPDxYEHwkFHS9pbWcvaWNvX2Fycm93X21lbnVleHBhbmQuZ2lmHwpoZGQCAg8VARBPbSBCb3N0YWRzYmlkcmFnZAILD2QWAgIBDxYEHwhkHwcFTi9DTS9UZW1wbGF0ZXMvQXJ0aWNsZS9nZW5lcmFsLmFzcHg/Y21ndWlkPTI1YWQ2Nzk2LWE3OTgtNGZmYi05ODEyLTI1MzUyODJkZTFhMxYEAgEPDxYEHwkFHS9pbWcvaWNvX2Fycm93X21lbnVleHBhbmQuZ2lmHwpoZGQCAg8VARhWYW5saWdhIGZyw6Vnb3Igb2NoIHN2YXJkAgYPDxYCHwpoZGQCCA8PFgIfAAUSTGVkaWdhIGzDpGdlbmhldGVyZGQCCg8WAh8KaBYCZg9kFgJmD2QWBAIDDw8WAh8ABQpIeXJlc3bDpHJkZGQCBQ8QZGQWAGQCDA9kFgZmD2QWDGYPZBYCZg8PFgYfAAURU25hYmIgaW5mbHl0dG5pbmcfAQVTL0NNL1RlbXBsYXRlcy9mYXEuYXNweD9jbWd1aWQ9Zjk5ODAwYTItNDZkNC00MjkzLWE3MTQtOGI3NTlmOWNiYzA5JnFpZD05MDUjb2JqSWQ5MDUeBlRhcmdldAUGX2JsYW5rZGQCAQ9kFgICAQ8PFgYfAQVTL0NNL1RlbXBsYXRlcy9mYXEuYXNweD9jbWd1aWQ9Zjk5ODAwYTItNDZkNC00MjkzLWE3MTQtOGI3NTlmOWNiYzA5JnFpZD05MDUjb2JqSWQ5MDUfAAURU25hYmIgaW5mbHl0dG5pbmcfDAUGX2JsYW5rZGQCAg9kFgJmDw8WBh8ABQ5Lb3J0dGlkc2JvZW5kZR8BBVMvQ00vVGVtcGxhdGVzL2ZhcS5hc3B4P2NtZ3VpZD1mOTk4MDBhMi00NmQ0LTQyOTMtYTcxNC04Yjc1OWY5Y2JjMDkmcWlkPTkwNiNvYmpJZDkwNh8MBQZfYmxhbmtkZAIDD2QWAgIBDw8WBh8BBVMvQ00vVGVtcGxhdGVzL2ZhcS5hc3B4P2NtZ3VpZD1mOTk4MDBhMi00NmQ0LTQyOTMtYTcxNC04Yjc1OWY5Y2JjMDkmcWlkPTkwNiNvYmpJZDkwNh8ABQ5Lb3J0dGlkc2JvZW5kZR8MBQZfYmxhbmtkZAIED2QWAmYPDxYGHwAFC1N0dWRlbnRsZ2guHwEFUy9DTS9UZW1wbGF0ZXMvZmFxLmFzcHg/Y21ndWlkPWY5OTgwMGEyLTQ2ZDQtNDI5My1hNzE0LThiNzU5ZjljYmMwOSZxaWQ9OTA3I29iaklkOTA3HwwFBl9ibGFua2RkAgUPZBYCAgEPDxYGHwEFUy9DTS9UZW1wbGF0ZXMvZmFxLmFzcHg/Y21ndWlkPWY5OTgwMGEyLTQ2ZDQtNDI5My1hNzE0LThiNzU5ZjljYmMwOSZxaWQ9OTA3I29iaklkOTA3HwAFC1N0dWRlbnRsZ2guHwwFBl9ibGFua2RkAgIPZBYQZg9kFgJmDw8WBh8ABQxTZW5pb3Jib2VuZGUfAQVTL0NNL1RlbXBsYXRlcy9mYXEuYXNweD9jbWd1aWQ9Zjk5ODAwYTItNDZkNC00MjkzLWE3MTQtOGI3NTlmOWNiYzA5JnFpZD05MDgjb2JqSWQ5MDgfDAUGX2JsYW5rZGQCAQ9kFgICAQ8PFgYfAQVTL0NNL1RlbXBsYXRlcy9mYXEuYXNweD9jbWd1aWQ9Zjk5ODAwYTItNDZkNC00MjkzLWE3MTQtOGI3NTlmOWNiYzA5JnFpZD05MDgjb2JqSWQ5MDgfAAUMU2VuaW9yYm9lbmRlHwwFBl9ibGFua2RkAgIPZBYCZg8PFgYfAAUPVGlsbGfDpG5nbGlnaGV0HwEFUy9DTS9UZW1wbGF0ZXMvZmFxLmFzcHg/Y21ndWlkPWY5OTgwMGEyLTQ2ZDQtNDI5My1hNzE0LThiNzU5ZjljYmMwOSZxaWQ9OTEwI29iaklkOTEwHwwFBl9ibGFua2RkAgMPZBYCAgEPDxYGHwEFUy9DTS9UZW1wbGF0ZXMvZmFxLmFzcHg/Y21ndWlkPWY5OTgwMGEyLTQ2ZDQtNDI5My1hNzE0LThiNzU5ZjljYmMwOSZxaWQ9OTEwI29iaklkOTEwHwAFD1RpbGxnw6RuZ2xpZ2hldB8MBQZfYmxhbmtkZAIED2QWAmYPDxYGHwAFDE55cHJvZHVrdGlvbh8BBVUvQ00vVGVtcGxhdGVzL2ZhcS5hc3B4P2NtZ3VpZD1mOTk4MDBhMi00NmQ0LTQyOTMtYTcxNC04Yjc1OWY5Y2JjMDkmcWlkPTExNjEjb2JqSWQxMTYxHwwFBl9ibGFua2RkAgUPZBYCAgEPDxYGHwEFVS9DTS9UZW1wbGF0ZXMvZmFxLmFzcHg/Y21ndWlkPWY5OTgwMGEyLTQ2ZDQtNDI5My1hNzE0LThiNzU5ZjljYmMwOSZxaWQ9MTE2MSNvYmpJZDExNjEfAAUMTnlwcm9kdWt0aW9uHwwFBl9ibGFua2RkAgYPZBYCZg8PFgYfAAUTRWogYmVzaXR0bmluZ3Nyw6R0dB8BBVUvQ00vVGVtcGxhdGVzL2ZhcS5hc3B4P2NtZ3VpZD1mOTk4MDBhMi00NmQ0LTQyOTMtYTcxNC04Yjc1OWY5Y2JjMDkmcWlkPTEyNDkjb2JqSWQxMjQ5HwwFBl9ibGFua2RkAgcPZBYCAgEPDxYGHwEFVS9DTS9UZW1wbGF0ZXMvZmFxLmFzcHg/Y21ndWlkPWY5OTgwMGEyLTQ2ZDQtNDI5My1hNzE0LThiNzU5ZjljYmMwOSZxaWQ9MTI0OSNvYmpJZDEyNDkfAAUcQmliZWjDpWxsZW4gcmVnaXN0cmVyaW5nc3RpZB8MBQZfYmxhbmtkZAIED2QWBGYPZBYCZg8PFgYfAAUHVW5nYWhlbR8BBVMvQ00vVGVtcGxhdGVzL2ZhcS5hc3B4P2NtZ3VpZD1mOTk4MDBhMi00NmQ0LTQyOTMtYTcxNC04Yjc1OWY5Y2JjMDkmcWlkPTkwOSNvYmpJZDkwOR8MBQZfYmxhbmtkZAIBD2QWAgIBDw8WBh8BBVMvQ00vVGVtcGxhdGVzL2ZhcS5hc3B4P2NtZ3VpZD1mOTk4MDBhMi00NmQ0LTQyOTMtYTcxNC04Yjc1OWY5Y2JjMDkmcWlkPTkwOSNvYmpJZDkwOR8ABQdVbmdhaGVtHwwFBl9ibGFua2RkAg4PPCsACwIADxYOHwYCDx8FFgAeEEN1cnJlbnRQYWdlSW5kZXgCAh4JUGFnZUNvdW50AgkeFV8hRGF0YVNvdXJjZUl0ZW1Db3VudAJ9HhBWaXJ0dWFsSXRlbUNvdW50An0eCFBhZ2VTaXplAg9kARQrAAlkPCsABAEAFgIeCkhlYWRlclRleHQFNUFkcmVzczxpbWcgc3JjPSIuLi8uLi9pbWcvZV9hcnJvd19kb3duLmdpZiIgYm9yZGVyPTA+PCsABAEAFgIfEgVAU3RhZHNkZWw8aW1nIHNyYz0iLi4vLi4vaW1nL2VfYXJyb3dfZG93bl9zZWxlY3RlZC5naWYiIGJvcmRlcj0wPjwrAAQBABYCHxIFMlJ1bTxpbWcgc3JjPSIuLi8uLi9pbWcvZV9hcnJvd19kb3duLmdpZiIgYm9yZGVyPTA+PCsABAEAFgIfEgU2U3RvcmxlazxpbWcgc3JjPSIuLi8uLi9pbWcvZV9hcnJvd19kb3duLmdpZiIgYm9yZGVyPTA+PCsABAEAFgIfEgUzSHlyYTxpbWcgc3JjPSIuLi8uLi9pbWcvZV9hcnJvd19kb3duLmdpZiIgYm9yZGVyPTA+PCsABAEAFgIfEgU3QW50LmFubS48aW1nIHNyYz0iLi4vLi4vaW1nL2VfYXJyb3dfZG93bi5naWYiIGJvcmRlcj0wPmRkFgJmD2QWHgICD2QWEmYPZBYEAgEPDxYEHwAFCERldGFsamVyHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD00YmMwZmY4Zi1hNGY0LTRmMjYtODU1MS1kYzUxNDc2OGYwOGRkZAIDDw8WAh8BBUNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9NGJjMGZmOGYtYTRmNC00ZjI2LTg1NTEtZGM1MTQ3NjhmMDhkZGQCAQ8PFgIfAAUWTGlsbGEgVHVubmxhbmRzZ2F0YW4gM2RkAgIPDxYCHwAFB0jDtmdzYm9kZAIDDw8WAh8ABQEzZGQCBA8PFgIfAAUCNjZkZAIFDw8WAh8ABQQ5NzgyZGQCBg9kFgICAQ9kFgJmDxUBAzE4M2QCBw9kFgQCAQ8PFgYfAQVhaHR0cDovL2thcnRvci5lbmlyby5zZS9xdWVyeT93aGF0PW1hcHMmZ2VvX2FyZWE9TGlsbGErVHVubmxhbmRzZ2F0YW4rKzMrJm1hcF9zaXplPTEmcGFydG5lcj12aXRlYx8AZR8KZ2RkAg8PDxYEHwIFDE55cHJvZHVrdGlvbh8KZ2RkAggPZBYEAgEPDxYCHwEFU29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD00YmMwZmY4Zi1hNGY0LTRmMjYtODU1MS1kYzUxNDc2OGYwOGQmYWN0aW9uPXJlZ2lzdGVyZGQCAw8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTRiYzBmZjhmLWE0ZjQtNGYyNi04NTUxLWRjNTE0NzY4ZjA4ZCZhY3Rpb249cmVnaXN0ZXJkZAIDD2QWEmYPZBYEAgEPDxYEHwAFCERldGFsamVyHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD05YzlkMTMyYS1kNGMzLTRmYWMtYTNlOS1mNTNjODcxMWE3MGJkZAIDDw8WAh8BBUNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9OWM5ZDEzMmEtZDRjMy00ZmFjLWEzZTktZjUzYzg3MTFhNzBiZGQCAQ8PFgIfAAUWTGlsbGEgVHVubmxhbmRzZ2F0YW4gM2RkAgIPDxYCHwAFB0jDtmdzYm9kZAIDDw8WAh8ABQEzZGQCBA8PFgIfAAUCNjVkZAIFDw8WAh8ABQQ5Njk2ZGQCBg9kFgICAQ9kFgJmDxUBAzE4NWQCBw9kFgQCAQ8PFgYfAQVhaHR0cDovL2thcnRvci5lbmlyby5zZS9xdWVyeT93aGF0PW1hcHMmZ2VvX2FyZWE9TGlsbGErVHVubmxhbmRzZ2F0YW4rKzMrJm1hcF9zaXplPTEmcGFydG5lcj12aXRlYx8AZR8KZ2RkAg8PDxYEHwIFDE55cHJvZHVrdGlvbh8KZ2RkAggPZBYEAgEPDxYCHwEFU29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD05YzlkMTMyYS1kNGMzLTRmYWMtYTNlOS1mNTNjODcxMWE3MGImYWN0aW9uPXJlZ2lzdGVyZGQCAw8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTljOWQxMzJhLWQ0YzMtNGZhYy1hM2U5LWY1M2M4NzExYTcwYiZhY3Rpb249cmVnaXN0ZXJkZAIED2QWEmYPZBYEAgEPDxYEHwAFCERldGFsamVyHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD02OTNkNjE5ZC0wNDRjLTRiMzMtYWJmNi0xNGU5ZGYzZTkwZGJkZAIDDw8WAh8BBUNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9NjkzZDYxOWQtMDQ0Yy00YjMzLWFiZjYtMTRlOWRmM2U5MGRiZGQCAQ8PFgIfAAUWTGlsbGEgVHVubmxhbmRzZ2F0YW4gM2RkAgIPDxYCHwAFB0jDtmdzYm9kZAIDDw8WAh8ABQEzZGQCBA8PFgIfAAUCNjVkZAIFDw8WAh8ABQQ5Njk2ZGQCBg9kFgICAQ9kFgJmDxUBAzE5MmQCBw9kFgQCAQ8PFgYfAQVhaHR0cDovL2thcnRvci5lbmlyby5zZS9xdWVyeT93aGF0PW1hcHMmZ2VvX2FyZWE9TGlsbGErVHVubmxhbmRzZ2F0YW4rKzMrJm1hcF9zaXplPTEmcGFydG5lcj12aXRlYx8AZR8KZ2RkAg8PDxYEHwIFDE55cHJvZHVrdGlvbh8KZ2RkAggPZBYEAgEPDxYCHwEFU29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD02OTNkNjE5ZC0wNDRjLTRiMzMtYWJmNi0xNGU5ZGYzZTkwZGImYWN0aW9uPXJlZ2lzdGVyZGQCAw8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTY5M2Q2MTlkLTA0NGMtNGIzMy1hYmY2LTE0ZTlkZjNlOTBkYiZhY3Rpb249cmVnaXN0ZXJkZAIFD2QWEmYPZBYEAgEPDxYEHwAFCERldGFsamVyHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD1hZjc0Yzg4OC1jZjg1LTRlMzMtOTUyYS0zMDZjNjEwMWU0ZTNkZAIDDw8WAh8BBUNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9YWY3NGM4ODgtY2Y4NS00ZTMzLTk1MmEtMzA2YzYxMDFlNGUzZGQCAQ8PFgIfAAUWTGlsbGEgVHVubmxhbmRzZ2F0YW4gM2RkAgIPDxYCHwAFB0jDtmdzYm9kZAIDDw8WAh8ABQEzZGQCBA8PFgIfAAUCNjZkZAIFDw8WAh8ABQQ5ODYxZGQCBg9kFgICAQ9kFgJmDxUBAzE4NWQCBw9kFgQCAQ8PFgYfAQVhaHR0cDovL2thcnRvci5lbmlyby5zZS9xdWVyeT93aGF0PW1hcHMmZ2VvX2FyZWE9TGlsbGErVHVubmxhbmRzZ2F0YW4rKzMrJm1hcF9zaXplPTEmcGFydG5lcj12aXRlYx8AZR8KZ2RkAg8PDxYEHwIFDE55cHJvZHVrdGlvbh8KZ2RkAggPZBYEAgEPDxYCHwEFU29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD1hZjc0Yzg4OC1jZjg1LTRlMzMtOTUyYS0zMDZjNjEwMWU0ZTMmYWN0aW9uPXJlZ2lzdGVyZGQCAw8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPWFmNzRjODg4LWNmODUtNGUzMy05NTJhLTMwNmM2MTAxZTRlMyZhY3Rpb249cmVnaXN0ZXJkZAIGD2QWEmYPZBYEAgEPDxYEHwAFCERldGFsamVyHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD1hNmIyZjEzZS1hOWI4LTRjMTgtODUyYS0wMjU4ZWM4MjAxMjlkZAIDDw8WAh8BBUNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9YTZiMmYxM2UtYTliOC00YzE4LTg1MmEtMDI1OGVjODIwMTI5ZGQCAQ8PFgIfAAUWTGlsbGEgVHVubmxhbmRzZ2F0YW4gM2RkAgIPDxYCHwAFB0jDtmdzYm9kZAIDDw8WAh8ABQEzZGQCBA8PFgIfAAUCNjZkZAIFDw8WAh8ABQQ5ODYxZGQCBg9kFgICAQ9kFgJmDxUBAzE4NGQCBw9kFgQCAQ8PFgYfAQVhaHR0cDovL2thcnRvci5lbmlyby5zZS9xdWVyeT93aGF0PW1hcHMmZ2VvX2FyZWE9TGlsbGErVHVubmxhbmRzZ2F0YW4rKzMrJm1hcF9zaXplPTEmcGFydG5lcj12aXRlYx8AZR8KZ2RkAg8PDxYEHwIFDE55cHJvZHVrdGlvbh8KZ2RkAggPZBYEAgEPDxYCHwEFU29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD1hNmIyZjEzZS1hOWI4LTRjMTgtODUyYS0wMjU4ZWM4MjAxMjkmYWN0aW9uPXJlZ2lzdGVyZGQCAw8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPWE2YjJmMTNlLWE5YjgtNGMxOC04NTJhLTAyNThlYzgyMDEyOSZhY3Rpb249cmVnaXN0ZXJkZAIHD2QWEmYPZBYEAgEPDxYEHwAFCERldGFsamVyHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD0xMWZmNTc2OS1mNTI0LTQ4NzMtODJiYy1mOTU5Y2M2NmRlMjFkZAIDDw8WAh8BBUNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9MTFmZjU3NjktZjUyNC00ODczLTgyYmMtZjk1OWNjNjZkZTIxZGQCAQ8PFgIfAAUWTGlsbGEgVHVubmxhbmRzZ2F0YW4gM2RkAgIPDxYCHwAFB0jDtmdzYm9kZAIDDw8WAh8ABQEzZGQCBA8PFgIfAAUCNjVkZAIFDw8WAh8ABQQ5Nzc1ZGQCBg9kFgICAQ9kFgJmDxUBAzE5MGQCBw9kFgQCAQ8PFgYfAQVhaHR0cDovL2thcnRvci5lbmlyby5zZS9xdWVyeT93aGF0PW1hcHMmZ2VvX2FyZWE9TGlsbGErVHVubmxhbmRzZ2F0YW4rKzMrJm1hcF9zaXplPTEmcGFydG5lcj12aXRlYx8AZR8KZ2RkAg8PDxYEHwIFDE55cHJvZHVrdGlvbh8KZ2RkAggPZBYEAgEPDxYCHwEFU29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD0xMWZmNTc2OS1mNTI0LTQ4NzMtODJiYy1mOTU5Y2M2NmRlMjEmYWN0aW9uPXJlZ2lzdGVyZGQCAw8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTExZmY1NzY5LWY1MjQtNDg3My04MmJjLWY5NTljYzY2ZGUyMSZhY3Rpb249cmVnaXN0ZXJkZAIID2QWEmYPZBYEAgEPDxYEHwAFCERldGFsamVyHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD1hMjliMjZhNS0wYTc2LTRmMzEtOTAwOC0wOTQyOGVmZWIwY2ZkZAIDDw8WAh8BBUNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9YTI5YjI2YTUtMGE3Ni00ZjMxLTkwMDgtMDk0MjhlZmViMGNmZGQCAQ8PFgIfAAUWTGlsbGEgVHVubmxhbmRzZ2F0YW4gM2RkAgIPDxYCHwAFB0jDtmdzYm9kZAIDDw8WAh8ABQEzZGQCBA8PFgIfAAUCNjVkZAIFDw8WAh8ABQQ5ODU0ZGQCBg9kFgICAQ9kFgJmDxUBAzE4MmQCBw9kFgQCAQ8PFgYfAQVhaHR0cDovL2thcnRvci5lbmlyby5zZS9xdWVyeT93aGF0PW1hcHMmZ2VvX2FyZWE9TGlsbGErVHVubmxhbmRzZ2F0YW4rKzMrJm1hcF9zaXplPTEmcGFydG5lcj12aXRlYx8AZR8KZ2RkAg8PDxYEHwIFDE55cHJvZHVrdGlvbh8KZ2RkAggPZBYEAgEPDxYCHwEFU29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD1hMjliMjZhNS0wYTc2LTRmMzEtOTAwOC0wOTQyOGVmZWIwY2YmYWN0aW9uPXJlZ2lzdGVyZGQCAw8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPWEyOWIyNmE1LTBhNzYtNGYzMS05MDA4LTA5NDI4ZWZlYjBjZiZhY3Rpb249cmVnaXN0ZXJkZAIJD2QWEmYPZBYEAgEPDxYEHwAFCERldGFsamVyHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD05NmNiMWUyOC0xMmUyLTQ5OGQtYmQ5ZS1mZGViZGY3ZjI0Y2RkZAIDDw8WAh8BBUNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9OTZjYjFlMjgtMTJlMi00OThkLWJkOWUtZmRlYmRmN2YyNGNkZGQCAQ8PFgIfAAUWTGlsbGEgVHVubmxhbmRzZ2F0YW4gM2RkAgIPDxYCHwAFB0jDtmdzYm9kZAIDDw8WAh8ABQEzZGQCBA8PFgIfAAUCNjZkZAIFDw8WAh8ABQUxMDAxOWRkAgYPZBYCAgEPZBYCZg8VAQMxMzJkAgcPZBYEAgEPDxYGHwEFYWh0dHA6Ly9rYXJ0b3IuZW5pcm8uc2UvcXVlcnk/d2hhdD1tYXBzJmdlb19hcmVhPUxpbGxhK1R1bm5sYW5kc2dhdGFuKyszKyZtYXBfc2l6ZT0xJnBhcnRuZXI9dml0ZWMfAGUfCmdkZAIPDw8WBB8CBQxOeXByb2R1a3Rpb24fCmdkZAIID2QWBAIBDw8WAh8BBVNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9OTZjYjFlMjgtMTJlMi00OThkLWJkOWUtZmRlYmRmN2YyNGNkJmFjdGlvbj1yZWdpc3RlcmRkAgMPDxYCHwEFU29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD05NmNiMWUyOC0xMmUyLTQ5OGQtYmQ5ZS1mZGViZGY3ZjI0Y2QmYWN0aW9uPXJlZ2lzdGVyZGQCCg9kFhJmD2QWBAIBDw8WBB8ABQhEZXRhbGplch8BBUNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9MDIzYWU5NTItMTA4Yi00YzZmLTg1MDMtZWE0M2YwOGUyNWJlZGQCAw8PFgIfAQVDb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTAyM2FlOTUyLTEwOGItNGM2Zi04NTAzLWVhNDNmMDhlMjViZWRkAgEPDxYCHwAFFkxpbGxhIFR1bm5sYW5kc2dhdGFuIDNkZAICDw8WAh8ABQdIw7Znc2JvZGQCAw8PFgIfAAUBM2RkAgQPDxYCHwAFAjY2ZGQCBQ8PFgIfAAUFMTAwMTlkZAIGD2QWAgIBD2QWAmYPFQEDMTMxZAIHD2QWBAIBDw8WBh8BBWFodHRwOi8va2FydG9yLmVuaXJvLnNlL3F1ZXJ5P3doYXQ9bWFwcyZnZW9fYXJlYT1MaWxsYStUdW5ubGFuZHNnYXRhbisrMysmbWFwX3NpemU9MSZwYXJ0bmVyPXZpdGVjHwBlHwpnZGQCDw8PFgQfAgUMTnlwcm9kdWt0aW9uHwpnZGQCCA9kFgQCAQ8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTAyM2FlOTUyLTEwOGItNGM2Zi04NTAzLWVhNDNmMDhlMjViZSZhY3Rpb249cmVnaXN0ZXJkZAIDDw8WAh8BBVNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9MDIzYWU5NTItMTA4Yi00YzZmLTg1MDMtZWE0M2YwOGUyNWJlJmFjdGlvbj1yZWdpc3RlcmRkAgsPZBYSZg9kFgQCAQ8PFgQfAAUIRGV0YWxqZXIfAQVDb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPWY3ZGU4Y2EyLTZjZDctNDk0YS04YTcwLTU1MDM4Nzg2YzBlZmRkAgMPDxYCHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD1mN2RlOGNhMi02Y2Q3LTQ5NGEtOGE3MC01NTAzODc4NmMwZWZkZAIBDw8WAh8ABRZMaWxsYSBUdW5ubGFuZHNnYXRhbiAzZGQCAg8PFgIfAAUHSMO2Z3Nib2RkAgMPDxYCHwAFATNkZAIEDw8WAh8ABQI2NWRkAgUPDxYCHwAFBDk5MzNkZAIGD2QWAgIBD2QWAmYPFQEDMTczZAIHD2QWBAIBDw8WBh8BBWFodHRwOi8va2FydG9yLmVuaXJvLnNlL3F1ZXJ5P3doYXQ9bWFwcyZnZW9fYXJlYT1MaWxsYStUdW5ubGFuZHNnYXRhbisrMysmbWFwX3NpemU9MSZwYXJ0bmVyPXZpdGVjHwBlHwpnZGQCDw8PFgQfAgUMTnlwcm9kdWt0aW9uHwpnZGQCCA9kFgQCAQ8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPWY3ZGU4Y2EyLTZjZDctNDk0YS04YTcwLTU1MDM4Nzg2YzBlZiZhY3Rpb249cmVnaXN0ZXJkZAIDDw8WAh8BBVNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9ZjdkZThjYTItNmNkNy00OTRhLThhNzAtNTUwMzg3ODZjMGVmJmFjdGlvbj1yZWdpc3RlcmRkAgwPZBYSZg9kFgQCAQ8PFgQfAAUIRGV0YWxqZXIfAQVDb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPWM4NzNmYzExLTlkN2QtNGQxMi1hZmM1LTc0NTEwMzE2NmMwMmRkAgMPDxYCHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD1jODczZmMxMS05ZDdkLTRkMTItYWZjNS03NDUxMDMxNjZjMDJkZAIBDw8WAh8ABRZMaWxsYSBUdW5ubGFuZHNnYXRhbiAzZGQCAg8PFgIfAAUHSMO2Z3Nib2RkAgMPDxYCHwAFATJkZAIEDw8WAh8ABQI1NGRkAgUPDxYCHwAFBDgxNzdkZAIGD2QWAgIBD2QWAmYPFQEDMjU5ZAIHD2QWBAIBDw8WBh8BBWFodHRwOi8va2FydG9yLmVuaXJvLnNlL3F1ZXJ5P3doYXQ9bWFwcyZnZW9fYXJlYT1MaWxsYStUdW5ubGFuZHNnYXRhbisrMysmbWFwX3NpemU9MSZwYXJ0bmVyPXZpdGVjHwBlHwpnZGQCDw8PFgQfAgUMTnlwcm9kdWt0aW9uHwpnZGQCCA9kFgQCAQ8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPWM4NzNmYzExLTlkN2QtNGQxMi1hZmM1LTc0NTEwMzE2NmMwMiZhY3Rpb249cmVnaXN0ZXJkZAIDDw8WAh8BBVNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9Yzg3M2ZjMTEtOWQ3ZC00ZDEyLWFmYzUtNzQ1MTAzMTY2YzAyJmFjdGlvbj1yZWdpc3RlcmRkAg0PZBYSZg9kFgQCAQ8PFgQfAAUIRGV0YWxqZXIfAQVDb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTk2N2ZkYjkxLTQ5YTEtNGFkZC04YzFiLTYzZDQ2NGI2NzdiY2RkAgMPDxYCHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD05NjdmZGI5MS00OWExLTRhZGQtOGMxYi02M2Q0NjRiNjc3YmNkZAIBDw8WAh8ABRZMaWxsYSBUdW5ubGFuZHNnYXRhbiAzZGQCAg8PFgIfAAUHSMO2Z3Nib2RkAgMPDxYCHwAFATJkZAIEDw8WAh8ABQI1NGRkAgUPDxYCHwAFBDgxNzdkZAIGD2QWAgIBD2QWAmYPFQEDMjM0ZAIHD2QWBAIBDw8WBh8BBWFodHRwOi8va2FydG9yLmVuaXJvLnNlL3F1ZXJ5P3doYXQ9bWFwcyZnZW9fYXJlYT1MaWxsYStUdW5ubGFuZHNnYXRhbisrMysmbWFwX3NpemU9MSZwYXJ0bmVyPXZpdGVjHwBlHwpnZGQCDw8PFgQfAgUMTnlwcm9kdWt0aW9uHwpnZGQCCA9kFgQCAQ8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTk2N2ZkYjkxLTQ5YTEtNGFkZC04YzFiLTYzZDQ2NGI2NzdiYyZhY3Rpb249cmVnaXN0ZXJkZAIDDw8WAh8BBVNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9OTY3ZmRiOTEtNDlhMS00YWRkLThjMWItNjNkNDY0YjY3N2JjJmFjdGlvbj1yZWdpc3RlcmRkAg4PZBYSZg9kFgQCAQ8PFgQfAAUIRGV0YWxqZXIfAQVDb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTUzYWVjNzJjLWVkMzUtNDQxMi05M2QwLWI2ZDc3MWFkNzVkZGRkAgMPDxYCHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD01M2FlYzcyYy1lZDM1LTQ0MTItOTNkMC1iNmQ3NzFhZDc1ZGRkZAIBDw8WAh8ABRZMaWxsYSBUdW5ubGFuZHNnYXRhbiAzZGQCAg8PFgIfAAUHSMO2Z3Nib2RkAgMPDxYCHwAFATJkZAIEDw8WAh8ABQI1NGRkAgUPDxYCHwAFBDgxNzdkZAIGD2QWAgIBD2QWAmYPFQEDMjI1ZAIHD2QWBAIBDw8WBh8BBWFodHRwOi8va2FydG9yLmVuaXJvLnNlL3F1ZXJ5P3doYXQ9bWFwcyZnZW9fYXJlYT1MaWxsYStUdW5ubGFuZHNnYXRhbisrMysmbWFwX3NpemU9MSZwYXJ0bmVyPXZpdGVjHwBlHwpnZGQCDw8PFgQfAgUMTnlwcm9kdWt0aW9uHwpnZGQCCA9kFgQCAQ8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTUzYWVjNzJjLWVkMzUtNDQxMi05M2QwLWI2ZDc3MWFkNzVkZCZhY3Rpb249cmVnaXN0ZXJkZAIDDw8WAh8BBVNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9NTNhZWM3MmMtZWQzNS00NDEyLTkzZDAtYjZkNzcxYWQ3NWRkJmFjdGlvbj1yZWdpc3RlcmRkAg8PZBYSZg9kFgQCAQ8PFgQfAAUIRGV0YWxqZXIfAQVDb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPWIyODllMzgzLTY3NGItNGJlZi1hNTUyLTBhMGQyY2JjNzcxZmRkAgMPDxYCHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD1iMjg5ZTM4My02NzRiLTRiZWYtYTU1Mi0wYTBkMmNiYzc3MWZkZAIBDw8WAh8ABRZsaWxsYSBUdW5ubGFuZHNnYXRhbiAzZGQCAg8PFgIfAAUHSMO2Z3Nib2RkAgMPDxYCHwAFATJkZAIEDw8WAh8ABQI1NGRkAgUPDxYCHwAFBDgyNTZkZAIGD2QWAgIBD2QWAmYPFQEDMjA1ZAIHD2QWBAIBDw8WBh8BBWFodHRwOi8va2FydG9yLmVuaXJvLnNlL3F1ZXJ5P3doYXQ9bWFwcyZnZW9fYXJlYT1saWxsYStUdW5ubGFuZHNnYXRhbisrMysmbWFwX3NpemU9MSZwYXJ0bmVyPXZpdGVjHwBlHwpnZGQCDw8PFgQfAgUMTnlwcm9kdWt0aW9uHwpnZGQCCA9kFgQCAQ8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPWIyODllMzgzLTY3NGItNGJlZi1hNTUyLTBhMGQyY2JjNzcxZiZhY3Rpb249cmVnaXN0ZXJkZAIDDw8WAh8BBVNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9YjI4OWUzODMtNjc0Yi00YmVmLWE1NTItMGEwZDJjYmM3NzFmJmFjdGlvbj1yZWdpc3RlcmRkAhAPZBYSZg9kFgQCAQ8PFgQfAAUIRGV0YWxqZXIfAQVDb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTZkY2QwNTkzLTQxMWMtNDU0NS05ZDFkLWM2ZDkyOGM2ZDJlMWRkAgMPDxYCHwEFQ29iamVjdF9kZXRhaWxzLmFzcHg/b2JqZWN0Z3VpZD02ZGNkMDU5My00MTFjLTQ1NDUtOWQxZC1jNmQ5MjhjNmQyZTFkZAIBDw8WAh8ABRZMaWxsYSBUdW5ubGFuZHNnYXRhbiAzZGQCAg8PFgIfAAUHSMO2Z3Nib2RkAgMPDxYCHwAFATJkZAIEDw8WAh8ABQI1NGRkAgUPDxYCHwAFBDgyNTZkZAIGD2QWAgIBD2QWAmYPFQEDMTk4ZAIHD2QWBAIBDw8WBh8BBWFodHRwOi8va2FydG9yLmVuaXJvLnNlL3F1ZXJ5P3doYXQ9bWFwcyZnZW9fYXJlYT1MaWxsYStUdW5ubGFuZHNnYXRhbisrMysmbWFwX3NpemU9MSZwYXJ0bmVyPXZpdGVjHwBlHwpnZGQCDw8PFgQfAgUMTnlwcm9kdWt0aW9uHwpnZGQCCA9kFgQCAQ8PFgIfAQVTb2JqZWN0X2RldGFpbHMuYXNweD9vYmplY3RndWlkPTZkY2QwNTkzLTQxMWMtNDU0NS05ZDFkLWM2ZDkyOGM2ZDJlMSZhY3Rpb249cmVnaXN0ZXJkZAIDDw8WAh8BBVNvYmplY3RfZGV0YWlscy5hc3B4P29iamVjdGd1aWQ9NmRjZDA1OTMtNDExYy00NTQ1LTlkMWQtYzZkOTI4YzZkMmUxJmFjdGlvbj1yZWdpc3RlcmRkAg8PZBYgAgMPDxYEHwIFC0Zyc3RhIHNpZGFuHwpnZGQCBQ8PFgQfAgURRsO2cmVnw6VlbmRlIHNpZGEfCmdkZAIHDw8WAh8CBQtOw6RzdGEgc2lkYWRkAgkPDxYCHwIFC1Npc3RhIHNpZGFuZGQCCw8PFgIfAAUJU2lkYTogMy85ZGQCDQ8PFgIfAAURQW50YWwgcG9zdGVyOiAxMjVkZAIPDw8WBh8ABQExHghDc3NDbGFzcwUJbmF2QnV0dG9uHgRfIVNCAgJkZAIRDw8WBh8ABQEyHxMFCW5hdkJ1dHRvbh8UAgJkZAITDw8WBh8ABQEzHxMFEXNlbGVjdGVkTmF2QnV0dG9uHxQCAmRkAhUPDxYGHwAFATQfEwUJbmF2QnV0dG9uHxQCAmRkAhcPDxYGHwAFATUfEwUJbmF2QnV0dG9uHxQCAmRkAhkPDxYGHwAFATYfEwUJbmF2QnV0dG9uHxQCAmRkAhsPDxYGHwAFATcfEwUJbmF2QnV0dG9uHxQCAmRkAh0PDxYGHwAFATgfEwUJbmF2QnV0dG9uHxQCAmRkAh8PDxYCHwpoZGQCIQ8PFgIfCmhkZAIRDw8WAh8ABR5JbmdhIG9iamVrdCDDpHIgdGlsbGfDpG5nbGlnYS5kZAISDw8WAh8ABQEzZGQCEw8PFgIfAAUKaGFyZV9uYW1lMmRkAhUPZBYCZg9kFgRmD2QWAmYPFgIeCmJhY2tncm91bmQFHi9pbWcvZV9kb3R0ZWRsaW5lX2hvcml6b250LmdpZhYCZg8WAh4Dc3JjBQ4vaW1nL2VfcHhsLmdpZmQCAQ9kFgJmD2QWCgIBD2QWAmYPPCsACQEADxYEHwUWAB8GAgNkFgZmD2QWAgIBDw8WAh8BBTkvRGVmYXVsdC5hc3B4P2NtZ3VpZD1iYzRhZTNmMy0yOWU0LTQxOTgtODA0Ni1iOTU2MzM4ZmFmOTFkFgJmDxUBA0hlbWQCAg9kFgICAQ8PFgIfAQU9L0hTUy9EZWZhdWx0LmFzcHg/Y21ndWlkPWRlZTliMTZkLTdiMzAtNDcwZC1hODBhLTUwODU3ZTRjMGM2MWQWAmYPFQEOU8O2ayBsw6RnZW5oZXRkAgQPZBYCAgEPDxYCHwFlZBYCZg8VAR88Yj5Mw6RnZW5oZXRlcjogYWxsYSBsZWRpZ2E8L2I+ZAIDDxYCHxYFFy9pbWcvZV9uYXZ0cmFpbF9zZXAuZ2lmZAIFDw8WAh8ABRAmbGFxdW87IFRpbGxiYWthZGQCBw8WAh8WBRcvaW1nL2VfbmF2dHJhaWxfc2VwLmdpZmQCCQ8PFgIfAAUIU2tyaXYgdXRkZAIXDxcAFgICAQ88KwAJAQAPFgQfBRYAHwYCAWQWAmYPZBYGAgEPDxYGHwkFPS9DTS9kaXNwbGF5X2FkLmFzcHg/Z3VpZD03OTZiZmFjNy01OWRjLTQ3NDktYTY2Yy1jMzI1MWUxYWZkNDcfAgUYaHR0cDovL3d3dy5ib3BsYXRzZ2JnLnNlHwEFdi9DTS94dF9iYW5uZXJfY2xpY2tlZC5hc3B4P3BhZ2U9NGU2ZTc4MWUtNTI1Ny00MDNlLWIwOWQtN2VmYzhlZGIwYWM4JnNlY3Rpb249MSZhZD03OTZiZmFjNy01OWRjLTQ3NDktYTY2Yy1jMzI1MWUxYWZkNDdkZAIDDw8WAh8KaGRkAgUPDxYCHwpoZBYCZg8VAQEwZAIYDxcAFgICAQ88KwAJAQAPFgQfBRYAHwYCAWQWAmYPZBYGAgEPDxYMHwkFPS9DTS9kaXNwbGF5X2FkLmFzcHg/Z3VpZD1lMWU3Y2ZkMy04NGMyLTRjZDUtOTZkMC0wNTdkZmYwNzY4OWMeBVdpZHRoGwAAAAAAIIdAAQAAAB4GSGVpZ2h0GwAAAAAAQGBAAQAAAB8CBSdHw6UgdGlsbCBmcmFtdGlkZW5zIGludGVybm9tZmx5dHRuaW5nYXIfAQV2L0NNL3h0X2Jhbm5lcl9jbGlja2VkLmFzcHg/cGFnZT00ZTZlNzgxZS01MjU3LTQwM2UtYjA5ZC03ZWZjOGVkYjBhYzgmc2VjdGlvbj0yJmFkPWUxZTdjZmQzLTg0YzItNGNkNS05NmQwLTA1N2RmZjA3Njg5Yx8UAoADZGQCAw8PFgIfCmhkZAIFDw8WAh8KaGQWAmYPFQEBMGQYAQUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9fFg8FHWRnTGlzdDpfY3RsMzppbWdOZXdseVByb2R1Y2VkBR1kZ0xpc3Q6X2N0bDQ6aW1nTmV3bHlQcm9kdWNlZAUdZGdMaXN0Ol9jdGw1OmltZ05ld2x5UHJvZHVjZWQFHWRnTGlzdDpfY3RsNjppbWdOZXdseVByb2R1Y2VkBR1kZ0xpc3Q6X2N0bDc6aW1nTmV3bHlQcm9kdWNlZAUdZGdMaXN0Ol9jdGw4OmltZ05ld2x5UHJvZHVjZWQFHWRnTGlzdDpfY3RsOTppbWdOZXdseVByb2R1Y2VkBR5kZ0xpc3Q6X2N0bDEwOmltZ05ld2x5UHJvZHVjZWQFHmRnTGlzdDpfY3RsMTE6aW1nTmV3bHlQcm9kdWNlZAUeZGdMaXN0Ol9jdGwxMjppbWdOZXdseVByb2R1Y2VkBR5kZ0xpc3Q6X2N0bDEzOmltZ05ld2x5UHJvZHVjZWQFHmRnTGlzdDpfY3RsMTQ6aW1nTmV3bHlQcm9kdWNlZAUeZGdMaXN0Ol9jdGwxNTppbWdOZXdseVByb2R1Y2VkBR5kZ0xpc3Q6X2N0bDE2OmltZ05ld2x5UHJvZHVjZWQFHmRnTGlzdDpfY3RsMTc6aW1nTmV3bHlQcm9kdWNlZO2R6184w93Nbt0R6VXd2Sg5aQgw",
								'ucTop:txtSearch': null
								};
							data['ucNavigationBarSimple:btn'+i] = i;

							$.ajax({
								type: "POST",
								data: data,
								cache: true,
								url: "http://www.boplats.se/HSS/Object/object_list.aspx?cmguid=4e6e781e-5257-403e-b09d-7efc8edb0ac8&objectgroup=1",
								dataType: 'html',
								success: processPageData(i, page_number),
								error: function(xhr, textStatus, error){
									customAlert(xhr.statusText+", "+textStatus+", "+error);
									},
								});
							
							}
						}

				//Mark initial AJAX req as complete
					ongoing_requests[0][0] = false;

				//Check if page fetch is completed
					checkPageFetchCompletion();

				},
			error: function(xhr, textStatus, error){
				customAlert(xhr.statusText+", "+textStatus+", "+error)
				},
			});
	
	}

function processPages(){
	
	//Find all objects
		for (var k = 0; k < pages_data.length; k++){
			buildObjectList(pages_data[k]);
			}

	//Clear old items in localStorage
		clearLocalStorageObjects(object_list);
	
	//Process objects
		for (key in object_list){
			
			//Object ID
				id = key;

			//Insert empty placeholder object
				objects[id] = {};

			//Check if object already exists in localStorage
				if (getLawnchair("object_"+id) != null){
					
					//Fetch data from localStorage and put into objects array
						objects[id] = JSON.parse(getLawnchair("object_"+id));

					}

			//Fetch data via AJAX
				else{
					
					//Track object AJAX req
						ongoing_requests[1][id] = true;

					//Fetch additional page data
						extractObjectDeep(id);
				
					}

			//Copy initial variables to object
				objects[id]['id'] = id;
				objects[id]['url'] = object_list[key]['url'];
				objects[id]['interested'] = object_list[key]['interested'];
			}

	//Check if there are ongoing object AJAX reqs
		checkOngoingObjectRequests();
	}

function buildObjectList(html_data){
	
	//Find objects in page
		$(html_data).find("table[id=dgList] tr.tbl_cell_list_even, table[id=dgList] tr.tbl_cell_list_odd").each(function(){
			
			//Find object columns
				var columns = $("td", this);

			//Find URL
				url = $("a", columns.eq(0)).attr('href');

			//Find object ID
				id = url.split("?")[1].split("=")[1];

			//Find interested
				interested = $("span", columns.eq(5)).text().trim();
			
			//Add object ID to object list
				object_list[id] = {id: id, url: url, interested: interested};
			
			});
	}

function clearLocalStorageObjects(active_objects){

	for (z = 0; z < keysLawnchair(); z++){
		exists = false;
		for (key in active_objects){
			if (localStorage.key(z) == "object_"+key){
				exists = true;
				break;
				}
			}
		if (exists == false){
			removeLawnchair(localStorage.key(z));
			}
		}
	}

function extractObjectDeep(id){
	
	//Initiate AJAX call to fetch more object data
		$.ajax({
			type: "GET",
			cache: true,
			url: "http://www.boplats.se/HSS/Object/object_details.aspx?objectguid=" + id,
			dataType: 'html',
			success: processObjectDeep(id),
			error: function(xhr, textStatus, error){
				customAlert(xhr.statusText+", "+textStatus+", "+error)
				},
			});
	}

function processObjectDeep(id){
	return function (returnData){
		
		//If response is null, restart ajax request
			regexp = new RegExp("HTTP request failed");
			if (regexp.test(returnData) == true || returnData == null){
				extractObjectDeep(id);
				return;
				}

		//Put data in object array
			objects[id]['size'] = $(returnData).find("span[id=lblSize]").text().trim().split(" ");
			objects[id]['floor'] = $(returnData).find("span[id=lblFloor], span[id=lblFloorTotal]").map(function(){return $(this).text().trim()}).get().join("");
			objects[id]['rooms'] = $(returnData).find("span[id=lblRooms]").text().trim();
			objects[id]['cost'] = $(returnData).find("span[id=lblCost]").text().trim();
			objects[id]['address'] = $(returnData).find("span[id=lblAddress1]").text().trim();
			objects[id]['move_in_date'] = $(returnData).find("span[id=lblMoveIn]").text().trim();
			objects[id]['available_date'] = $(returnData).find("span[id=lblDateAvailable]").text().trim();
			objects[id]['last_reg_date'] = $(returnData).find("span[id=lblLastRegDate]").text().trim();
			objects[id]['boplats_id'] = $(returnData).find("span[id=lblObjectId]").text().trim();
			objects[id]['area'] = $(returnData).find("span[id=lblArea]").text().trim();
			objects[id]['area2'] = $(returnData).find("a[id=hlArea2]").text().trim();
			objects[id]['description'] = $(returnData).find("span[id=lblDescription]").text().trim();
			objects[id]['floor_plan'] = $(returnData).find("span[id=lblPlanning]").text().trim();
			objects[id]['properties'] = $(returnData).find("table[id=dlProperties] b").map(function(){return $(this).text().trim()}).get().join(", ");
			objects[id]['images'] = $(returnData).find("table[id=dlMultimedia] img").map(function(){pattern = /ico_pdf\.gif$/; if (pattern.test($(this).attr("src")) == false && validateContentType("http://www.boplats.se"+$(this).attr("src").trim(), "image") == true){return "http://www.boplats.se"+$(this).attr("src").trim()}}).get();
			objects[id]['pdfs'] = $(returnData).find("table[id=dlMultimedia] a").map(function(){return $(this).attr("href").trim().replace(/\.{2}\/\.{2}/, "http://www.boplats.se")}).get();
			objects[id]['icons'] = $(returnData).find("tr[id=trIcons] a.apartment_detail_legend").map(function(){return {id: $(this).attr("id"), src: $("img", this).attr("src").trim().replace(/\.{2}\/\.{2}/, "http://www.boplats.se")};}).get();
		
		//Cache object to local storage
			setLawnchair("object_"+id, JSON.stringify(objects[id]));

		//Set object tracking to complete
			ongoing_requests[1][id] = false;

		//Check if there are ongoing object AJAX reqs
			checkOngoingObjectRequests();
		}
	}

function validateContentType(url, type){
	results = false;
	pattern = new RegExp("^"+type+"/");
	$.ajax({
		async: false,
		type: "HEAD",
		cache: true,
		url: url,
		success: function(data, textStatus, jqXHR){
			results = pattern.test(jqXHR.getResponseHeader('Content-Type'));
			},
		error: function(jqXHR, textStatus, errorThrown){
			results = false;
			}
		});
	return results;
	}

function scrollToOpenCollapsible(current_collapsible){
	
	//Check if there are any expanded items waiting to be collapsed
		var current_index = $(current_collapsible).index();
		$(current_collapsible).parent().children().each(function(){
			if (current_index != $(this).index() && $(this).collapsible("option", "collapsed") == false){
				setTimeout(function(){scrollToOpenCollapsible(current_collapsible)}, 5);
				return false;
				}
			});
	
	//Scroll
		$.mobile.silentScroll($(current_collapsible).offset().top);
	}

function filterObjects(object_array){
	
	var new_object_array = Array();
	
	for (key in object_array){
		(function(){
			
			//Filters

				//Area
					if ($.inArray(object_array[key]['area'], $("input[id^='area[']:checked").map(function(){return $(this).val()}).get()) == -1){
						return;
						}

				//Rooms
					if (parseInt(object_array[key]['rooms']) < $("#min_rooms").val() || parseInt(object_array[key]['rooms']) > $("#max_rooms").val()){
						return;
						}
				
				//Cost
					if (parseInt(object_array[key]['cost']) < $("#min_cost").val() || parseInt(object_array[key]['cost']) > $("#max_cost").val()){
						return;
						}

				//Size
					if (parseInt(object_array[key]['size'][0]) < $("#min_size").val() || parseInt(object_array[key]['size'][0]) > $("#max_size").val()){
						return;
						}

				//Floor
					if (parseInt(object_array[key]['floor']) < $("#min_floor").val() || parseInt(object_array[key]['floor']) > $("#max_floor").val()){
						return;
						}

				//Available
					if ($("#available").val() != null && $.datepicker.parseDate('yy-mm-dd', $("#available").val()) > $.datepicker.parseDate('yy-mm-dd', object_array[key]['move_in_date'])){
						return;
						}

				//Icons
					for (z = 0; z < object_array[key]['icons'].length; z++){
						if ($.inArray(object_array[key]['icons'][z].id, $("input[id^='icon[']:checked").map(function(){return $(this).val()}).get()) == -1){
							return;
							}
						}

			//Add to new array
				new_object_array.push(object_array[key]);
			})();
		}
	
	return new_object_array;
	}

function sortObjects(object_array){
	
	//Empty sorting order
		sorting_order = Array();

	//Build new sorting order
		$("#sort_list li").each(function(){
			sorting_order.push($(this).attr("value"));
			});

	return object_array.sort(customSort);
	}

function customSort(a, b, level){
	
	//If level is undefined, set to initial level
		if (typeof(level) === "undefined"){
			level =	0;
			}

	//Fetch sorting column
		sorting_column = sorting_order[level];

	//Comparison values
		var pattern = /^\d+$/;
		value_a = $.isArray(a[sorting_column]) == true ? pattern.test(a[sorting_column][0]) == true ? parseInt(a[sorting_column][0]) : a[sorting_column][0].toLowerCase() : pattern.test(a[sorting_column]) == true ? parseInt(a[sorting_column]) : a[sorting_column].toLowerCase();
		value_b = $.isArray(b[sorting_column]) == true ? pattern.test(b[sorting_column][0]) == true ? parseInt(b[sorting_column][0]) : b[sorting_column][0].toLowerCase() : pattern.test(b[sorting_column]) == true ? parseInt(b[sorting_column]) : b[sorting_column].toLowerCase();

	//Run nested sorting function if needed
		if (value_a == value_b && level < (sorting_order.length - 1)){
			return customSort(a, b, (level + 1));
			}

	return value_a > value_b ? 1 : -1;
	}

function showResults(){

	//Create collapsibleset div
		collapsiblesetdiv = $("<div>");
		collapsiblesetdiv.attr("data-role", "collapsibleset");
		collapsiblesetdiv.attr("data-theme", "a");
		collapsiblesetdiv.attr("data-content-theme", "a");
		collapsiblesetdiv.attr("data-inset", false);

	//Filter & sort objects
		var temp_objects = new Array();
		temp_objects = filterObjects(objects);
		temp_objects = sortObjects(temp_objects);

	//Add objects to collabsibleset div
		for (key in temp_objects){
			addResultObject(temp_objects[key], collapsiblesetdiv);
			}

	//Append to results page
		$("#resultsPage div[role='main']").append(collapsiblesetdiv);
	
	//Activate collapsibleset widget
		collapsiblesetdiv.collapsibleset().trigger('create');
		collapsiblesetdiv.children(":first").trigger('expand');

	//Hide spinner
		spinnerplugin.hide();
	
	location.hash = "#resultsPage";
	}

function addResultObject(object, collapsiblesetdiv){

	//Create collapsiblediv
		var collapsiblediv = $("<div>").appendTo(collapsiblesetdiv)
			.attr("data-role", "collapsible")
			.on("collapsibleexpand", function (event, ui){
				scrollToOpenCollapsible(this);
				});

	//Add header
		var header = $("<h3>").appendTo(collapsiblediv);
		header.html(object['address'] + " (" + object['area2'] + ", " + (typeof(language[object["area"]]) !== "undefined" ? language[object["area"]] : object["area"]) + ")");
	
	//Add body (<p>)
		var p = $("<p>").appendTo(collapsiblediv);

	//Icons
		var icons_div = $("<div>");
		if (object['icons'].length > 0){
			for (z = 0; z < object['icons'].length; z++){
				var img = $("<img>")
					.attr("src", object['icons'][z].src)
					.css({
						"padding-left": "5px",
						"padding-right": "5px",
						})
					.appendTo(icons_div);
				}
			}

	//Grid of details
		grid = Array(
			Array(language["cost"], object['cost'], language["rooms"], object['rooms']),
			Array(language["access"], object['move_in_date'], language["floor"], object['floor']),
			Array(language["available"], object['available_date'], language["size"], object['size'].join("&nbsp;")),
			Array(language["signup_date_short"], object['last_reg_date'], language["interested_short"], object['interested']),
			Array("Boplats&nbsp;ID", object['boplats_id'], null, icons_div)
			);

		for (z = 0; z < grid.length; z++){
			var div = $("<div>").addClass("ui-grid-a")
				.append($("<div>")
					.addClass("ui-block-a bold")
					.css("width", "30%")
					.append(grid[z][0]))
				.append($("<div>")
					.addClass("ui-block-b")
					.css("width", "30%")
					.append(grid[z][1]))
				.append($("<div>")
					.addClass("ui-block-c bold")
					.css("width", "25%")
					.append(grid[z][2]))
				.append($("<div>")
					.addClass("ui-block-d")
					.css("width", "15%")
					.append(grid[z][3]));
			p.append(div);
			}

	//Description
		if (typeof(object['description']) !== 'undefined'){
			var div = $("<div>")
				.addClass("bold")
				.html(language["description"]);
			p.append(div).append(object['description'].replace(/(<([^>]+)>)/ig,""));
			}
	
	//Properties
		if (typeof(object['properties']) !== 'undefined'){
			var div = $("<div>")
				.addClass("bold")
				.html(language["properties"]);
			p.append(div).append(object['properties'].replace(/(<([^>]+)>)/ig,""));
			}

	//Floor plan
		if (typeof(object['floor_plan']) !== 'undefined'){
			var div = $("<div>")
				.addClass("bold")
				.html(language["floor_plan"]);
			p.append(div).append(object['floor_plan'].replace(/(<([^>]+)>)/ig,""));
			}
	
	//Buttons
		var buttons_div = $("<fieldset data-role='controlgroup' data-type='horizontal'>").appendTo(p);

		//Location button
			location_btn = $("<a>")
				.appendTo(buttons_div)
				.addClass("ui-btn ui-shadow ui-corner-all ui-icon-location ui-btn-icon-notext")
				.click({address: object['address'], area: (object['area'] == "Kommuner nära Göteborg" ? object['area2'] : "Göteborg")}, function(event){
					spinnerShow(true, function(){
						$("#mapIframe").get(0).contentWindow.setAddressMarker(event.data.address+", "+event.data.area);
						$("#mapPopup").popup("open", {
							"positionTo": "window",
							"transition": "fade",
							"tolerance": "15,15,15,15",
							})
							.popup({
								afterclose: function(){
									$("#mapIframe").get(0).contentWindow.removeAddressMarker();
									},
								});
						})
					});

		//Images button
			if (object['images'].length > 0){
				image_btn = $("<a>")
					.appendTo(buttons_div)
					.addClass("ui-btn ui-shadow ui-corner-all ui-icon-camera ui-btn-icon-notext")
					.click({imgs: object['images']}, function(event){
						spinnerShow(true, function(){
							img = $("<img>")
								.attr("id", "image_object")
								.addClass("photo")
								.load(function(){
									$("#imagePopup").popup("open", {
										"positionTo": "window",
										"transition": "fade",
										})
										.popup({
											afterclose: function(){
												$("#image_object").remove();
												},
											});
									})
								.error(function(){
									$("#image_object").remove();
									customAlert(language["image_error_msg"]+" ("+this.src+")");
									spinnerplugin.hide();
									console.log('image error:' + this.src);
									})
								.attr("src", event.data.imgs[0]);
							$("#imagePopup").append(img);
							})
						});
				}

		//PDF button
			if (object['pdfs'].length > 0){
				pdf_btn = $("<a>")
					.appendTo(buttons_div)
					.addClass("ui-btn ui-shadow ui-corner-all ui-icon-grid ui-btn-icon-notext")
					.click({pdfs: object['pdfs']}, function(event){
						window.open(event.data.pdfs[0], "_blank", "location=no,EnableViewPortScale=yes");
						});
				}

		//Facebook button
			facebook_btn = $("<a>")
				.appendTo(buttons_div)
				.addClass("ui-btn ui-shadow ui-corner-all ui-icon-facebook ui-btn-icon-notext")
				.click({id: object["id"], address: object["address"]}, function(event){
					spinnerShow(true, function(){
						
						window.plugins.socialsharing.shareViaFacebook(event.data.address, null, "http://www.boplats.se/HSS/Object/object_details.aspx?objectguid="+event.data.id, function(){console.log('share ok'); spinnerplugin.hide();}, function(errormsg){customAlert(errormsg); spinnerplugin.hide();});
						alert('callback called');
						});
					});

		//Twitter button
			twitter_btn = $("<a>")
				.appendTo(buttons_div)
				.addClass("ui-btn ui-shadow ui-corner-all ui-icon-twitter ui-btn-icon-notext")
				.click({id: object["id"], address: object["address"]}, function(event){
					spinnerShow(true, function(){
						window.plugins.socialsharing.shareViaTwitter(event.data.address, null, "http://www.boplats.se/HSS/Object/object_details.aspx?objectguid="+event.data.id, function(){console.log('share ok'); spinnerplugin.hide();}, function(errormsg){customAlert(errormsg); spinnerplugin.hide();});
						})
					});

	}

function checkOngoingObjectRequests(){
	//Return true if there are still ongoing requests
		for (key in ongoing_requests[1]){
			if (ongoing_requests[1][key] == true){
				updateProgress();
				return true;
				}
			}

	//Remove spinner
		spinnerplugin.hide();

	//If there are no ongoing requests, complete status bar and change to search page

		//Enable navbar
			$("[data-role='navbar']").navbar("option", "disabled", false);

		updateProgress(100);
		location.hash = "#searchPage";
	}

function updateProgress(value){
	
	//If no value is defined, calculate approximate progress based on ongoing requests compared to total requests
		if (typeof(value) === "undefined"){
			var count = 0;
			for (key in ongoing_requests[1]){
				if (ongoing_requests[1][key] == false){
					count++;
					}
				}
			value = (count / Object.keys(ongoing_requests[1]).length) * 80 + 20;

			//Update texts on splash page
				$("#download_count").text(count + " / " + Object.keys(ongoing_requests[1]).length);
			}

	//Update progress bar
		$("#progressbar").progressbar("value", Math.round(value));

	}

function checkUUID(){

	//If no UUID exists in database, set one
		if (getLawnchair("UUID") == null){
			setLawnchair("UUID", device.uuid);
			}

	//Check if database UUID does not match current UUID
		if (getLawnchair("UUID") != device.uuid){
			//Set new UUID
				setLawnchair("UUID", device.uuid);

			//Clear login details in database
				removeLawnchair("username");
				removeLawnchair("password");

			}
	}

function encrypt(string){
	var key = hexToByteArray(device.uuid);
	var mode = 'ECB'; // ECB or CBC
	return byteArrayToHex(rijndaelEncrypt(string,key, mode));
	}

function decrypt(encrypted_string){
	var key = hexToByteArray(device.uuid);
	var mode = 'ECB'; // ECB or CBC
	return byteArrayToString(rijndaelDecrypt(hexToByteArray(encrypted_string), key, mode))
	}

function saveUserDetails(){
	if ($("#username").val() != "" && $("#password").val() != ""){
		setLawnchair("username", encrypt($("#username").val()));
		setLawnchair("password", encrypt($("#password").val()));
		login(function (param1){customAlert(param1);});
		}
	else{
		customAlert(language["login_error_msg1"]);
		}
	}

function login(callback){
	
	if(typeof callback == "function"){
		callback("testparam1");
		}

	//Build POST data
		var data = {
			'__EVENTVALIDATION': "/wEWBwKbrqjUAgKlwZm8CwKBtOJ/Aq7x3JgDAqz7luoPAp37up0OAuCKqIUOL12C4QGf4GLttUKp8wZLaSRdMHM=",
			'__VIEWSTATE': "/wEPDwULLTEzODUzNzc3NTQPZBYCZg9kFhQCAQ9kFhJmDw8WBB4EVGV4dAUKSW4gRW5nbGlzaB4LTmF2aWdhdGVVcmwFIS9sYW5nL2NoYW5nZV9sYW5nLmFzcHg/bGFuZz1lbi1VU2RkAgEPDxYEHwAFCFNpdGUgTWFwHwEFES9DTS9zaXRlX21hcC5hc3B4ZGQCAg8PFgQfAAUHQ29va2llcx8BBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD1hYWYzOGYwNy1hMWE0LTQ3NjUtOTMxZS02OGRiMjQ1MzA3ZGNkZAIDDw8WBB8ABQVQcmVzcx8BBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD04ZGJhMjg2Mi0wNTg3LTRlZmItOGMwOC02MWUwOGI2MWFhZmVkZAIEDw8WBB8ABQlUeWNrIHRpbGwfAQUWL2NvbnRhY3QvZmVlZGJhY2suYXNweGRkAgcPDxYCHgdUb29sVGlwBStBbmdlIHPDtmt1dHRyeWNrIG9jaCBrbGlja2EgcMOlIDxiPlPDtms8L2I+ZGQCCQ8WAh4FdmFsdWUFBFPDtmtkAgwPFgQfAwUITG9nZ2EgaW4eB29uY2xpY2sFUWphdmFzY3JpcHQ6d2luZG93LmxvY2F0aW9uLmhyZWY9Jy91c2VyL2xvZ2luX2hzLmFzcHg/UmV0dXJuVXJsPS9IU1MvRGVmYXVsdC5hc3B4J2QCEQ8PFgQfAAURUmVnaXN0cmVyYSBkaWcgLT4fAQUXL0hTUy9Vc2VyL3JlZ2lzdGVyLmFzcHhkZAIDD2QWAmYPZBYCZg88KwAJAQAPFgQeCERhdGFLZXlzFgAeC18hSXRlbUNvdW50AgpkFhRmD2QWAgIBDxYEHgRocmVmBTkvRGVmYXVsdC5hc3B4P2NtZ3VpZD1iYzRhZTNmMy0yOWU0LTQxOTgtODA0Ni1iOTU2MzM4ZmFmOTEeBnRhcmdldGQWAmYPFQEDSGVtZAIBD2QWAgIBDxYEHwcFTi9DTS9UZW1wbGF0ZXMvQXJ0aWNsZS9nZW5lcmFsLmFzcHg/Y21ndWlkPWVlODJmNmU5LWZjYTYtNDU2YS1hNjk3LTAwOTA5NmMzNmUwMR8IZBYCZg8VAQpPbSBCb3BsYXRzZAICD2QWAgIBDxYEHwcFPS9IU1MvRGVmYXVsdC5hc3B4P2NtZ3VpZD1kZWU5YjE2ZC03YjMwLTQ3MGQtYTgwYS01MDg1N2U0YzBjNjEfCGQWAmYPFQEOU8O2ayBsw6RnZW5oZXRkAgMPZBYCAgEPFgQfBwVML0hTTS9FeGNoYW5nZU9iamVjdC9kZWZhdWx0LmFzcHg/Y21ndWlkPTRmNWU1OWI3LTI2ZmMtNDFkMS04YmEzLThiMzhhNzc5OTFlOB8IZBYCZg8VAQxCeXRlc2LDtnJzZW5kAgQPZBYCAgEPFgQfBwVUL0hTTS9TdWJsZXRPYmplY3QvZGVmYXVsdC5hc3B4P2NtZ3VpZD04YzYxYjQ5Zi02NDEzLTRhYzMtOTc1ZS04MWViMzRmNjk2MGMmc3VvdHlwZT0xHwhkFgJmDxUBCUFuZHJhaGFuZGQCBQ9kFgICAQ8WBB8HBUsvSFNTL09iamVjdFByaXZhdGUvZGVmYXVsdC5hc3B4P2NtZ3VpZD00MzdmNzFhNC00NGMyLTQ0MmEtOGViZS1jZDRkMjU4YTVlOTkfCGQWAmYPFQEJS8O2cCBueXR0ZAIGD2QWAgIBDxYEHwcFTi9DTS9UZW1wbGF0ZXMvQXJ0aWNsZS9nZW5lcmFsLmFzcHg/Y21ndWlkPWZkZDc2MjcwLWI3ODAtNGQxYS05OWUwLWNjNWI1Zjc3NWE0MR8IZBYCZg8VAQZTZW5pb3JkAgcPZBYCAgEPFgQfBwVOL0NNL1RlbXBsYXRlcy9BcnRpY2xlL2dlbmVyYWwuYXNweD9jbWd1aWQ9ODRiMDc5NzYtMDZlNy00MzRmLWI1ZjEtMTY5NzM1NWQ2NDVhHwhkFgJmDxUBBlVuZ2RvbWQCCA9kFgICAQ8WBB8HBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD00ZmEyOTI4MS0yZjkzLTQyM2QtYmM3My1jMjdiYWJiNTU1ZmMfCGQWAmYPFQEHU3R1ZGVudGQCCQ9kFgICAQ8WBB8HBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD02ZjI1ZDUzYS02OGJhLTQ3ZTQtOTI0Ni0zYTJlZGRhZjYzODcfCGQWAmYPFQEKSHlyZXN2w6RyZGQCBQ9kFgICAQ88KwAJAQAPFgQfBRYAHwYCDGQWGGYPZBYCAgEPFgYfCGQfBwVdL3VzZXIvbG9naW5faHMuYXNweD9jbWd1aWQ9ZDc1NjQyNzktYjE3Ni00ZjEzLTkxNzQtM2ZjNmU0NzlhOWE0JlJldHVyblVSTD0uLi9IU1MvRGVmYXVsdC5hc3B4HgVzdHlsZQUZYmFja2dyb3VuZC1jb2xvcjojMEE0OTk3OxYEAgEPDxYEHghJbWFnZVVybAUdL2ltZy9pY29fYXJyb3dfbWVudWV4cGFuZC5naWYeB1Zpc2libGVoZGQCAg8VAQhMb2dnYSBpbmQCAQ9kFgICAQ8WBB8IZB8HBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD00NTYxZDY2ZS1lOWM2LTQzNzgtYjk5YS05NmU3MjIwYTY0MzUWBAIBDw8WBB8KBR0vaW1nL2ljb19hcnJvd19tZW51ZXhwYW5kLmdpZh8LaGRkAgIPFQEVUGVyc29udXBwZ2lmdGVyIChQdUwpZAICD2QWAgIBDxYEHwhkHwcFQy9IU1MvVXNlci9yZWdpc3Rlci5hc3B4P2NtZ3VpZD1hOTBlZmZlMy0xZGFhLTQzNjQtYjJkMS04Zjg0MDg3YTY5NDkWBAIBDw8WBB8KBR0vaW1nL2ljb19hcnJvd19tZW51ZXhwYW5kLmdpZh8LaGRkAgIPFQEOUmVnaXN0cmVyYSBkaWdkAgMPZBYCAgEPFgQfCGQfBwVWL0hTUy9PYmplY3Qvb2JqZWN0X2xpc3QuYXNweD9jbWd1aWQ9NGU2ZTc4MWUtNTI1Ny00MDNlLWIwOWQtN2VmYzhlZGIwYWM4Jm9iamVjdGdyb3VwPTEWBAIBDw8WBB8KBR0vaW1nL2ljb19hcnJvd19tZW51ZXhwYW5kLmdpZh8LaGRkAgIPFQEYTMOkZ2VuaGV0ZXI6IGFsbGEgbGVkaWdhZAIED2QWAgIBDxYEHwhkHwcFZS9IU1MvT2JqZWN0L29iamVjdF9saXN0LmFzcHg/Y21ndWlkPTE0ODlmNDQ4LWY2MmItNDk1MC04MDE5LWIxNDgwNTE1ZmE1NSZvYmplY3Rncm91cD0xJmFjdGlvbj1ob3RsaXN0FgQCAQ8PFgQfCgUdL2ltZy9pY29fYXJyb3dfbWVudWV4cGFuZC5naWYfC2hkZAICDxUBFkzDpGdlbmhldGVyOiBueWlua29tbmFkAgUPZBYCAgEPFgQfCGQfBwVKL0hTUy9PYmplY3Qvb2JqZWN0X3NlYXJjaC5hc3B4P2NtZ3VpZD1iNDY0NjZiZS03OTcxLTQyZGUtYWQxMy04NDNkOWUwODk5YjgWBAIBDw8WBB8KBR0vaW1nL2ljb19hcnJvd19tZW51ZXhwYW5kLmdpZh8LaGRkAgIPFQEUTMOkZ2VuaGV0ZXI6IHNvcnRlcmFkAgYPZBYCAgEPFgQfCGQfBwVOL0NNL1RlbXBsYXRlcy9BcnRpY2xlL2dlbmVyYWwuYXNweD9jbWd1aWQ9ZDZjZjJjYjYtOGQzYS00ZjcxLTkyY2MtOTQ1NjQ4YzhlMmEyFgQCAQ8PFgQfCgUdL2ltZy9pY29fYXJyb3dfbWVudWV4cGFuZC5naWYfC2hkZAICDxUBGFPDpSBzw7ZrZXIgZHUgaHlyZXNyw6R0dGQCBw9kFgICAQ8WBB8IZB8HBU4vQ00vVGVtcGxhdGVzL0FydGljbGUvZ2VuZXJhbC5hc3B4P2NtZ3VpZD1mYjEwMTdjMC1iMDY2LTQxYjQtYmZmMy0xNDk4MWI3NTM1YTYWBAIBDw8WBB8KBR0vaW1nL2ljb19hcnJvd19tZW51ZXhwYW5kLmdpZh8LaGRkAgIPFQEIT21yw6VkZW5kAggPZBYCAgEPFgQfCGQfBwVOL0NNL1RlbXBsYXRlcy9BcnRpY2xlL2dlbmVyYWwuYXNweD9jbWd1aWQ9YmIwOWMzNDMtYjhhMC00NmFjLTk5NGUtN2ZhYzYwNjhmNDA2FgQCAQ8PFgQfCgUdL2ltZy9pY29fYXJyb3dfbWVudWV4cGFuZC5naWYfC2hkZAICDxUBFlRpcHMgZsO2ciBkZW4gc8O2a2FuZGVkAgkPZBYCAgEPFgQfCGQfBwVIL0hTUy9Vc2VyL3NlbmRfcGFzc3dvcmQuYXNweD9jbWd1aWQ9ZTlkODcxNWQtYjYwYy00ZGU1LTkwOTAtZGY2YTc1MGM3ZjgxFgQCAQ8PFgQfCgUdL2ltZy9pY29fYXJyb3dfbWVudWV4cGFuZC5naWYfC2hkZAICDxUBDkdsw7ZtdCBQSU4ta29kZAIKD2QWAgIBDxYEHwhkHwcFTi9DTS9UZW1wbGF0ZXMvQXJ0aWNsZS9nZW5lcmFsLmFzcHg/Y21ndWlkPTg4OTM1MTQ3LTQwODQtNGEwOC1iM2ExLTQ4M2I1ZjNmNTk4MxYEAgEPDxYEHwoFHS9pbWcvaWNvX2Fycm93X21lbnVleHBhbmQuZ2lmHwtoZGQCAg8VARBPbSBCb3N0YWRzYmlkcmFnZAILD2QWAgIBDxYEHwhkHwcFTi9DTS9UZW1wbGF0ZXMvQXJ0aWNsZS9nZW5lcmFsLmFzcHg/Y21ndWlkPTI1YWQ2Nzk2LWE3OTgtNGZmYi05ODEyLTI1MzUyODJkZTFhMxYEAgEPDxYEHwoFHS9pbWcvaWNvX2Fycm93X21lbnVleHBhbmQuZ2lmHwtoZGQCAg8VARhWYW5saWdhIGZyw6Vnb3Igb2NoIHN2YXJkAgcPZBYCAgEPDxYCHwAFCExvZ2dhIGluZGQCCQ8PFgIfC2hkZAILD2QWAmYPPCsACQEADxYEHwUWAB8GAgFkFgJmD2QWAgIBD2QWAmYPFQHZATxTUEFOIGlkPWxibEluc3RydWN0aW9uPkZ5bGwgaSBkaXR0IHBlcnNvbm51bW1lciBuZWRhbi4gSGFyIGR1IGludGUgc3ZlbnNrdCBwZXJzb25udW1tZXIgZnlsbGVyIGR1IGkgZGVuIGFudsOkbmRhcmlkZW50aXRldCBkdSBmaWNrIHZpZCByZWdpc3RyZXJpbmcuIMOEciBkdSBueSBhbnbDpG5kYXJlIGtsaWNrYXIgZHUgcMOlIGzDpG5rZW4gUmVnaXN0cmVyYSBkaWcuIDwvU1BBTj5kAhUPDxYCHwAFAk9LZGQCHQ9kFgJmD2QWBGYPZBYCZg8WAh4KYmFja2dyb3VuZAUeL2ltZy9lX2RvdHRlZGxpbmVfaG9yaXpvbnQuZ2lmFgJmDxYCHgNzcmMFDi9pbWcvZV9weGwuZ2lmZAIBD2QWAmYPZBYKAgEPZBYCZg88KwAJAQAPFgQfBRYAHwYCA2QWBmYPZBYCAgEPDxYCHwEFOS9EZWZhdWx0LmFzcHg/Y21ndWlkPWJjNGFlM2YzLTI5ZTQtNDE5OC04MDQ2LWI5NTYzMzhmYWY5MWQWAmYPFQEDSGVtZAICD2QWAgIBDw8WAh8BBT0vSFNTL0RlZmF1bHQuYXNweD9jbWd1aWQ9ZGVlOWIxNmQtN2IzMC00NzBkLWE4MGEtNTA4NTdlNGMwYzYxZBYCZg8VAQ5Tw7ZrIGzDpGdlbmhldGQCBA9kFgICAQ8PFgIfAWVkFgJmDxUBDzxiPkxvZ2dhIGluPC9iPmQCAw8WAh8NBRcvaW1nL2VfbmF2dHJhaWxfc2VwLmdpZmQCBQ8PFgIfAAUQJmxhcXVvOyBUaWxsYmFrYWRkAgcPFgIfDQUXL2ltZy9lX25hdnRyYWlsX3NlcC5naWZkAgkPDxYCHwAFCFNrcml2IHV0ZGQCHw8XABYCAgEPPCsACQEADxYEHwUWAB8GAgFkFgJmD2QWBgIBDw8WBh8KBT0vQ00vZGlzcGxheV9hZC5hc3B4P2d1aWQ9Nzk2YmZhYzctNTlkYy00NzQ5LWE2NmMtYzMyNTFlMWFmZDQ3HwIFGGh0dHA6Ly93d3cuYm9wbGF0c2diZy5zZR8BBXYvQ00veHRfYmFubmVyX2NsaWNrZWQuYXNweD9wYWdlPWQ3NTY0Mjc5LWIxNzYtNGYxMy05MTc0LTNmYzZlNDc5YTlhNCZzZWN0aW9uPTEmYWQ9Nzk2YmZhYzctNTlkYy00NzQ5LWE2NmMtYzMyNTFlMWFmZDQ3ZGQCAw8PFgIfC2hkZAIFDw8WAh8LaGQWAmYPFQEBMGQCIQ8XABYCAgEPPCsACQEADxYEHwUWAB8GAgFkFgJmD2QWBgIBDw8WDB8KBT0vQ00vZGlzcGxheV9hZC5hc3B4P2d1aWQ9ZTFlN2NmZDMtODRjMi00Y2Q1LTk2ZDAtMDU3ZGZmMDc2ODljHgVXaWR0aBsAAAAAACCHQAEAAAAeBkhlaWdodBsAAAAAAEBgQAEAAAAfAgUnR8OlIHRpbGwgZnJhbXRpZGVucyBpbnRlcm5vbWZseXR0bmluZ2FyHwEFdi9DTS94dF9iYW5uZXJfY2xpY2tlZC5hc3B4P3BhZ2U9ZDc1NjQyNzktYjE3Ni00ZjEzLTkxNzQtM2ZjNmU0NzlhOWE0JnNlY3Rpb249MiZhZD1lMWU3Y2ZkMy04NGMyLTRjZDUtOTZkMC0wNTdkZmYwNzY4OWMeBF8hU0ICgANkZAIDDw8WAh8LaGRkAgUPDxYCHwtoZBYCZg8VAQEwZGRwvJnnse2LUqyrn3F4Ek+yCYAf1w==",
			'cmdOK': "OK",
			'txtID': decrypt(getLawnchair("username")),
			'txtPwd': decrypt(getLawnchair("password")),
			'ucTop:txtSearch': null
			}
	
	//Initiate AJAX call to fetch more object data
		$.ajax({
			type: "POST",
			cache: false,
			async: false,
			data: data,
			url: "https://www.boplats.se/user/login_hs.aspx?ReturnUrl=/HSS/Default.aspx",
			dataType: 'html',
			beforesend: function(){
				$.mobile.loader("show");
				},
			success: processLoginForm(),
			error: function(xhr, textStatus, error){
				customAlert(xhr.status+", "+xhr.statusText+", "+textStatus+", "+error)
				},
			});
	}

function logout(){
	
	}

function processLoginForm(){
	return function (returnData){
		if (returnData != null){
			if ($(returnData).find("input[id=ucTop_btnLogin]").length > 0){
				if ($(returnData).find("input[id=ucTop_btnLogin]").val() == "Logga ut"){
					customAlert('true in processLoginForm');
					return true;
					}
				}
			}
		else{
			customAlert('false in processLoginForm');
			return false;
			}
		}
	}

function setLanguage(lang){
	
	//Get browser language
		browser_language = $.localise.defaultLanguage.substring(0, 2);

	//No language has been previously selected, set a default language
		if (getLawnchair("language") == null){
			setLawnchair("language", $.localise.defaultLanguage);
			}

	//If variable lang is provided
		if (typeof(lang) !== "undefined"){
			setLawnchair("language", lang);
			}

	//Load language into items
		$.localise("lang", {language: getLawnchair("language"), path: "languages/"});
		$("body").addClass("ui-loading");
		$("[lang-id]").each(function(){
			
			//Exception for collapsible headings
				if ($(this).hasClass("ui-collapsible-heading")){
					$("a", this).html(language[$(this).attr("lang-id")]+"<span class='ui-collapsible-heading-status'> click to expand contents</span>");
					}
			
			//Else
				else{
					$(this).text(language[$(this).attr("lang-id")]);
					}
			});
		$("body").removeClass("ui-loading");
	}

function customAlert(message, vibrate){
	navigator.notification.alert(message, function(){}, "");
	if (typeof(vibrate) !== "undefined" && vibrate == true){
		navigator.notification.vibrate(1000);
		}

	}

function onDeviceReady(){
	
	//Add slight header margin for iOS 7
		/*if (device.platform == 'iOS' && device.version >= '7.0'){
			document.body.style.marginTop = "20px";
			}*/

	//Flush database if not latest version
		if (getLawnchair("database_ver") != database_ver){
			clearLawnchair();
			setLawnchair("database_ver", database_ver);
			}

	//Navbar/footer
		$(function(){
			$( "[data-role='navbar']" ).navbar({disabled: true});
			$( "[data-role='header'], [data-role='footer']" ).toolbar();
		});

		$(document).on("pageshow", "[data-role='page']", function(){
			
			// Remove active class from nav buttons
				$("[data-role='navbar'] a.ui-btn-active").removeClass("ui-btn-active");
			
			// Add active class to current nav button
				current_page = $(this).attr("id");
				$("[data-role='navbar'] a").each(function(){
					if ($(this).attr("href") === "#"+current_page){
						$(this).addClass("ui-btn-active");
						}
					});
			});

	//Check UUID
		//checkUUID();

	//Set initial splash page
		location.hash = "#startPage";

	//Fetch categories
		fetchCategories();

	//Listeners
		$(document).on("pagebeforeshow", "#categoryPage", function(event, ui){
			fetchItems(active_category);
			
			//Reset item form
				active_item = null;
				$("#attributes").empty();
				$("#imagePreview").empty();
				$("<input>").attr("type", "button").val("Camera").click(function(){uploadImage(1)}).button().appendTo($("#imagePreview"));
				$("<input>").attr("type", "button").val("Choose existing").click(function(){if (isPhoneGap()) {uploadImage(0)} else {$('#imageFile').click()}}).button().appendTo($("#imagePreview"));
			});

		

	//Hide navbar on input/textarea focus
		$("input, textarea, select").on("focus", function(){
			$("div[data-role='footer']").hide();
			});

		$("input, textarea, select").on("blur", function(){
			$("div[data-role='footer']").show();
			});

	//Swipe actions on images
		//Navigate to the next page on swipeleft
			$(document).on("swipeleft", "#itemPage1, #itemPage2, #itemPage3", function(event) {
				navNextPage();
				});

		//The same for the navigating to the previous page
			$(document).on("swiperight", "#itemPage1, #itemPage2, #itemPage3", function(event) {
				navPreviousPage();
				});

	//Show page loader during page switch
		$(document).on("pagebeforeshow", function(){
			//spinnerShow(true);
			});

		$(document).on("pageshow", function(){
			//spinnerplugin.hide();
			});
	}

function fetchCategories(){	
	$.ajax({
		type: "POST",
		url: API_URL + "?function=fetchCategories",
		dataType: 'json',
		cache: false,
		success: function(returnData){
			$("#categories").empty();
			$.each(returnData, function(key, value){
				$("<li id="+key+"><a>"+value+"</a></li>").appendTo($("#categories")).click(function(){
					active_category = $(this).attr("id");
					location.hash = "categoryPage";
					});
				})
			$("#categories").listview("refresh");
			},
		error: function(xhr, textStatus, error){
			alert(xhr.statusText+", "+textStatus+", "+error)
			},
		});
	}

function fetchItems(category){
	return;
	$.ajax({
		type: "POST",
		url: API_URL + "?function=fetchItems",
		dataType: 'json',
		cache: false,
		data: {category:category},
		success: function(returnData){
			$("#items").empty();
			$.each(returnData, function(key, value){
				$("<li id="+key+"><a>"+value+"</a></li>").appendTo($("#items")).click(function(){
					active_category = $(this).attr("id");
					location.hash = "categoryPage";
					});
				})
			$("#items").listview("refresh");
			},
		error: function(xhr, textStatus, error){
			alert(xhr.statusText+", "+textStatus+", "+error)
			},
		});
	}

function addCategory(){
	$.ajax({
		type: "POST",
		url: API_URL + "?function=addCategory",
		dataType: 'text',
		cache: false,
		data: {'category_name':$("#category_name").val()},
		success: function(returnData){
			$("#category_name").val(null);
			location.hash = "#categoryPage";
			active_category = returnData;
			},
		error: function(xhr, textStatus, error){
			alert(xhr.statusText+", "+textStatus+", "+error);
			},
		});
	}

function addItem(){

	/*post_data = {'category':active_category};
	$.ajax({
		type: "POST",
		url: API_URL + "?function=addItem",
		dataType: 'text',
		cache: false,
		data: JSON.stringify(post_data),
		success: function(returnData){*/
			location.hash = "#addItem";
			/*active_item = returnData;
			},
		error: function(xhr, textStatus, error){
			alert(xhr.statusText+", "+textStatus+", "+error);
			},
		});*/
	}

function uploadImage(source){
	
	function initialiseProgressbar(){
		$("#imagePreview").empty();
		$("#imagePreview").append($("<div id=progressbar><div class=progress-label></div></div>"));
		$("#progressbar").progressbar({
			value: 0,
			change: function(){
				$("#progressbar .progress-label").text($(this).progressbar("value") + "%");
				},
			});
		}
	
	function updateProgressbar(value){
		$("#progressbar").progressbar({
			value: value,
			});
		}

	function successfulUpload(returnData){
		active_item = returnData.item;
		$("#imagePreview").empty();
		img = $("<img>");
		img.attr("src", API_URL + "?function=showImage&id="+returnData.image);
		img.css("width", "100%");
		$("#imagePreview").append(img);
		generateAttributeList();
		}

	if (isPhoneGap()){
		
		//Take new picture
			navigator.camera.getPicture(onSuccess, onFail, {
				quality: 30, 
				sourceType: source,
				destinationType: Camera.DestinationType.FILE_URI,
				encodingType: Camera.EncodingType.JPEG,
				targetWidth: $(window).width(),
				targetHeight: $(window).height(),
				saveToPhotoAlbum: false,
				});
		
		function onSuccess(imageURI){
			
			//Set upload options
				var options = new FileUploadOptions();
				options.fileKey = "imageFile";
				options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
				options.mimeType = "image/jpeg";
				options.headers = {
					category: active_category,
					};
				options.params = {
					category: active_category,
					};

			//Create FileTransfer object
				ft = new FileTransfer();

			//Progress bar initiate
				initialiseProgressbar();

			//Progress bar update
				ft.onprogress = function(progressEvent) {
					if (progressEvent.lengthComputable) {
						var percentComplete = Math.floor(progressEvent.loaded / progressEvent.total * 100);
						updateProgressbar(percentComplete);
						}
					};

			//Start upload
				ft.upload(
					imageURI, 
					encodeURI('http://46.16.233.117/judys_closet/api.php?function=addImage'), 
					function (r){
						console.log(r.response);
						successfulUpload(JSON.parse(r.response));
						}, 
					function(error){
						alert('fail');
						alert('Failed: '+error.code);
						}, 
					options);
			}

		function onFail(message) {
			setTimeout(function() {
				console.log(message);
				alert('Failed because: ' + message);
				}, 0);
			
			}

		}
	else{
		$('#imageForm').ajaxSubmit({
			data: {'category':active_category, 'item':active_item},
			dataType: 'json',
			beforeSend: function(){
				initialiseProgressbar();
				},
			uploadProgress: function(event, position, total, percentComplete){
				updateProgressbar(percentComplete);
				},
			success: function(returnData){
				successfulUpload(returnData);
				},
			});
		}
	}

function cameraSelection(){
	
	}

function generateAttributeList(extra_attribute){

	collapsibleset = $("<div>");
	collapsibleset.attr("id", "collapsibleset");
	collapsibleset.attr("data-role", "collapsibleset");
	
	//New attribute
		collapsiblenew = $("<div>");
		collapsiblenew.attr("data-role", "collapsible");
		collapsiblenew.append($("<h3>").text("New attribute"));
		collapsiblenew.attr("data-icon", "plus");
		collapsiblenew.appendTo(collapsibleset);
		collapsiblenew.click(function(){location.hash = "#addAttribute"; showSelectableAttributes();});
		

	$.ajax({
		async: false,
		type: "POST",
		url: API_URL + "?function=fetchAttributes",
		dataType: 'json',
		cache: false,
		data: {'category':active_category, 'item':active_item},
		success: function(returnData){
			if (typeof(extra_attribute) !== "undefined"){
				collapsible = $("<div>").appendTo(collapsibleset);
				collapsible.attr("data-role", "collapsible");
				collapsible.attr("id", "attribute_"+extra_attribute.id);
				collapsible.attr("data-collapsed-icon", "carat-r");
				collapsible.attr("data-expanded-icon", "carat-d");

				h3 = $("<h3>").appendTo(collapsible);
				h3.text(extra_attribute.name);
				h3.append($("<span id='attribute_list_"+extra_attribute.id+"' style='font-weight:lighter'>").text(""));
				
				p = $("<p>").appendTo(collapsible);
				p.attr("id", "p_"+extra_attribute.id);
				showOptions(p, extra_attribute.id);

				collapsible.append(h3);
				}
			
			$(returnData).each(function(){
				collapsible = $("<div>").appendTo(collapsibleset);
				collapsible.attr("data-role", "collapsible");
				collapsible.attr("id", "attribute_"+this.id);
				collapsible.attr("data-collapsed-icon", "carat-r");
				collapsible.attr("data-expanded-icon", "carat-d");

				h3 = $("<h3>").appendTo(collapsible);
				h3.text(this.name);
				h3.append($("<span id='attribute_list_"+this.id+"' style='font-weight:lighter'>").text(""));
				
				p = $("<p>").appendTo(collapsible);
				p.attr("id", "p_"+this.id);
				showOptions(p, this.id);

				updateAttributeOptionsList(this.id);

				});
			$("#attributes").empty();
			$("#attributes").append(collapsibleset);
			collapsibleset.collapsibleset();
			collapsiblenew.collapsible("disable");
			collapsibleset.trigger('create');
			
			},
		error: function(xhr, textStatus, error){
			alert(xhr.statusText+", "+textStatus+", "+error);
			},
		});
	
	
	}

function addAttribute(){
	var result = prompt("New attribute");
	if (result != null){
		$.ajax({
			type: "POST",
			url: API_URL + "?function=addAttribute",
			dataType: 'json',
			cache: false,
			data: {'attribute':result},
			success: function(returnData){
				selectAttribute(returnData.id, returnData.name);
				},
			error: function(xhr, textStatus, error){
				alert(xhr.statusText+", "+textStatus+", "+error);
				},
			});
		}
	}

function showSelectableAttributes(){
	$.ajax({
		type: "POST",
		url: API_URL + "?function=fetchSelectableAttributes",
		dataType: 'json',
		cache: false,
		data: {'category':active_category},
		success: function(returnData){
			$("#existing_attributes").empty();
			list = $("<ul>").appendTo($("#existing_attributes"));
			
			li = $("<li>").appendTo(list);
			a = $("<a>").appendTo(li);
			a.text("Add new attribute");
			a.click(function(){
				addAttribute();
				});

			li = $("<li>").appendTo(list);
			li.text("Existing attributes");
			li.attr("data-role", "list-divider");
			
			$(returnData).each(function(){
				li = $("<li>").appendTo(list);
				a = $("<a>").appendTo(li);
				a.attr("id", this.id);
				a.text(this.name);
				a.click({'id':this.id,'text':this.name}, function(event){
					selectAttribute(event.data.id, event.data.text);
					generateAttributeList({'id':event.data.id,'name':event.data.text});
					});
				});
			
			list.listview();
			},
		error: function(xhr, textStatus, error){
			alert(xhr.statusText+", "+textStatus+", "+error);
			},
		});
	}

function selectAttribute(id, name){
	generateAttributeList({'id':id,'name':name});
	location.hash = "#addItem";
	}

function showOptions(object, attribute){
	object.empty();
	fieldset = $("<fieldset>").appendTo(object);
	fieldset.attr("data-role", "controlgroup");
	
	$.ajax({
		type: "POST",
		url: API_URL + "?function=fetchOptions",
		dataType: 'json',
		cache: false,
		async: false,
		data: {'attribute':attribute, 'item':active_item},
		success: function(returnData){
			input = $("<input>").appendTo(fieldset);
			input.attr("type", "button");
			input.val("Add new option");
			input.click(function(){
				addOption(attribute);
				});

			$.each(returnData, function(){
				input = $("<input>").appendTo(fieldset);
				input.attr("type", "checkbox");
				input.attr("name", "option_"+this.id);
				input.attr("id", "option_"+this.id);
				input.attr("checked", this.checked);

				input.click({'id':this.id}, function(event){
					selectOption(event.data.id, $(this).prop("checked"), attribute);
					});
				
				label = $("<label>").appendTo(fieldset);
				label.attr("for", "option_"+this.id);
				label.text(this.name);
				label.append($("<a name='anchor_"+attribute+"_"+this.id+"'>"));
				});
			fieldset.parent().trigger('create');
			},
		error: function(xhr, textStatus, error){
			alert(xhr.statusText+", "+textStatus+", "+error);
			},
		});
	}

function addOption(attribute){
	var result = prompt("New option");
	if (result != null){
		$.ajax({
			type: "POST",
			url: API_URL + "?function=addOption",
			dataType: 'json',
			cache: false,
			data: {'attribute':attribute,'option':result,'category':active_category,'item':active_item},
			success: function(returnData){
				selectOption(returnData.id, true, attribute);
				showOptions($("#attribute_"+attribute).find("p"), attribute);
				updateAttributeOptionsList(attribute);
				$("#collapsibleset").trigger('create');
				location.hash = "#anchor_"+attribute+"_"+returnData.id;
				},
			error: function(xhr, textStatus, error){
				alert(xhr.statusText+", "+textStatus+", "+error);
				},
			});
		}
	}

function selectOption(id, selected, attribute){
	$.ajax({
		type: "POST",
		url: API_URL + "?function=selectOption",
		dataType: 'text',
		cache: false,
		async: false,
		data: {'category':active_category,'item':active_item,'option':id,'selected':(selected == true ? 1 : 0)},
		success: function(returnData){
			updateAttributeOptionsList(attribute);
			},
		error: function(xhr, textStatus, error){
			alert(xhr.statusText+", "+textStatus+", "+error);
			},
		});
	}

function updateAttributeOptionsList(attribute){
	temp_array = Array();
	//alert($("#attribute_"+attribute).html());
	$("#attribute_"+attribute).find(".ui-checkbox").each(function(){
		if ($(this).find("input[type=checkbox]").is(':checked') == true){
			temp_array.push($(this).find("label").text());
			}
		});
	$("#attribute_list_"+attribute).text(" ("+temp_array.join(", ")+")");
	}

function showItems(){
	$.ajax({
		type: "POST",
		url: API_URL + "?function=fetchItems",
		dataType: 'json',
		cache: false,
		data: {category:active_category},
		success: function(returnData){
			item_list = returnData.items;
			image_list = returnData.images;
			active_item = item_list[0];
			preloadImages(1, 0);
			location.hash = "#itemPage" + 2;
			},
		error: function(xhr, textStatus, error){
			alert(xhr.statusText+", "+textStatus+", "+error)
			},
		});
	}

function preloadImages(curr_page_index, curr_item_index){
	//Curr
		curr_page = item_page_number_array[curr_page_index];
		curr_item = image_list[curr_item_index];
		//$("#item_image"+curr_page).attr("src", API_URL + "?function=showImage&id=" + curr_item);
	
	//Prev
		prev_page_index = curr_page_index-1;
		prev_page = item_page_number_array[prev_page_index];
		prev_item_index = curr_item_index-1;
		prev_item = image_list.slice(prev_item_index)[0];
		$("#item_image"+prev_page).attr("src", API_URL + "?function=showImage&id=" + prev_item);
	
	//Next
		next_page_index = (curr_page_index+1) > (item_page_number_array.length-1) ? 0 : (curr_page_index+1);
		next_page = item_page_number_array[next_page_index];
		next_item_index = (curr_item_index+1) > (item_list.length-1) ? 0 : (curr_item_index+1);
		next_item = item_list[next_item_index]
		$("#item_image"+next_page).attr("src", API_URL + "?function=showImage&id=" + next_item);

	}

function navPreviousPage(){
	page_index = item_page_number_array.indexOf(active_item_page_number)-1;
	active_item_page_number = item_page_number_array[page_index];
	console.log("#itemPage" + item_page_number_array.slice(page_index)[0]);
	$(":mobile-pagecontainer").pagecontainer("change", "#itemPage" + item_page_number_array.slice(page_index)[0], {
		transition: "slide",
		reverse: true,
		});
	item_index = item_list.indexOf(active_item)-1;
	active_item = item_list.slice(item_index)[0];

	preloadImages(page_index, item_index);
	}

function navNextPage(){
	page_index = item_page_number_array.indexOf(active_item_page_number)+1;
	page_index = page_index > (item_page_number_array.length-1) ? 0 : page_index;
	active_item_page_number = item_page_number_array[page_index];
	console.log("#itemPage"+item_page_number_array[page_index]);
	$(":mobile-pagecontainer").pagecontainer("change", "#itemPage"+item_page_number_array[page_index], {
		transition: "slide",
		});
	item_index = item_list.indexOf(active_item)+1;
	item_index = item_index > (item_list.length-1) ? 0 : item_index;
	active_item = item_list[item_index];

	preloadImages(page_index, item_index);
	}