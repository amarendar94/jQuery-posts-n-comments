var posts;
var users;
var comments;
var jsonArray = [];
var len = 10;

var latestPoint = 0;
var currentPoint = 0;

if (localStorage.mainArray) {
    $("#getdata").hide();
    jsonArray = JSON.parse(localStorage.mainArray);
    populateData();
}

function reduceJSON(){
    
    jsonArray = posts.slice();
    for(var i=0; i<posts.length; i++){
        jsonArray[i].username = getUsername(jsonArray[i].userId);
        jsonArray[i].liked = false;
        jsonArray[i].comments = [];       
        var cmts = fetchcomments(jsonArray[i].id);
        for(var j = 0; j<cmts.length; j++){
            var obj = {};
            obj.comment = cmts[j];
            obj.liked = false;
            jsonArray[i].comments.push(obj);
        }

    }
    localStorage.mainArray = JSON.stringify(jsonArray);
}

 function fetchdata() {
    Promise.all([getUsers(), getPosts(), getComments()]).then((data) => {       
        users = data[0];
        posts = data[1];       
        comments = data[2];
        reduceJSON();
        populateData();
  //      window.addEventListener('scroll', myEfficientFn);

    });   
     
}

function getUsername(id) {
    for(var i=0;i<users.length;i++){
        if(users[i].id == id){
            return users[i].username;
        }
    }
}

function populateData() {
    var htmldata = "";   
    //var len = jsonArray.length;

    for (var i = 0; i < len; i++) {
        if(jsonArray[i].liked == true){
            bgc = "lightblue";
        }else{
            bgc = "transparent";
        }

        htmldata += `<section id="section_${jsonArray[i].id}"><h5>${jsonArray[i].username}</h5><h6>${jsonArray[i].title}</h6><p>${jsonArray[i].body}</p>
        <button id="like_${jsonArray[i].id}" onclick="likeit(this.id)" style="background-color:${bgc};">Like</button>
        <button id="delete_${jsonArray[i].id}" onclick="deleteit(this.id)">Delete</button>
        <button id="comment_${jsonArray[i].id}" onclick="displayComments(this.id)">Comments</button><div class="coms" id="comments_${jsonArray[i].id}" ></div></section>`;  
    }
  
    document.getElementById("display").innerHTML = htmldata;
     
}

function deleteit(id){
    var i = parseInt(id.split('_')[1]);
    $(`#section_${i}`).remove();
    for(var k=0;k<jsonArray.length;k++){
        if(jsonArray[k].id == i){
            console.log(jsonArray[k]);
            jsonArray.splice(k,1);             
        }
    }   
    localStorage.mainArray = JSON.stringify(jsonArray);
    jsonArray = JSON.parse(localStorage.mainArray);
    populateData(); 
}

function likeit(id){
    document.getElementById(id).style.backgroundColor="lightblue";
    var s = parseInt(id.split('_')[1]);
    for(var k=0;k<jsonArray.length;k++){
        if(jsonArray[k].id == s){
            jsonArray[k].liked = true;
                     
        }
    }
    localStorage.mainArray = JSON.stringify(jsonArray);
}

function addNewComment(postid){
    var pst_id = parseInt(postid.split('_')[1]);
    var input_id = `newComment_${pst_id}`;
    for(var k=0;k<jsonArray.length;k++){
        if(jsonArray[k].id == pst_id){
            //console.log(document.getElementById(input_id).value);
            var str = `${document.getElementById(input_id).value} <input type="button" value="Like" id="likecmt_${pst_id}_${jsonArray[k].comments.length}" onclick="likeComment(this.id)" ` ;
            jsonArray[k].comments.push({ comment : str, liked:false}); 
            console.log(jsonArray[k].comments);
        }
    }
    displayComments(postid);
    localStorage.mainArray = JSON.stringify(jsonArray);    
}

function likeComment(cmtid){
    console.log(cmtid);
    var post_id = parseInt(cmtid.split('_')[1]);
    var comment_loc = parseInt(cmtid.split('_')[2]);
    for(var k=0;k<jsonArray.length;k++){
        if(jsonArray[k].id == post_id){
            jsonArray[k].comments[comment_loc].liked=true;
        }
    }
    document.getElementById(cmtid).style.backgroundColor = "lightblue";
    localStorage.mainArray = JSON.stringify(jsonArray);
}

function displayComments(id){
    
    var post_id = parseInt(id.split('_')[1]);
    var htm = `<p><input type="text" id="newComment_${post_id}" ><input type="button" id="addComment_${post_id}" value="Add" onclick="addNewComment(this.id)"></p>`;
    for(var k=0;k<jsonArray.length;k++){
        if(jsonArray[k].id == post_id){
            
            for(var j = 0; j<jsonArray[k].comments.length; j++){
                
                if(jsonArray[k].comments[j].liked == true){
                    bgc = "lightblue";
                }else{
                    bgc = "transparent";
                }               
                htm += `<p>${jsonArray[k].comments[j].comment}style="background-color:${bgc};"></p>`;                
            }                    
        }
    }
    document.getElementById(`comments_${post_id}`).innerHTML = htm;
}

function fetchcomments(post_id){
    
    var commentsArr = [];
    //var htm = ""  
    var x=0;
    for(var i=0;i<comments.length;i++){      
        if(comments[i].postId == (post_id)){  
            //console.log(comments[i].postId,"-",post_id);
            var str = `${comments[i].name}: ${comments[i].body} <input type="button" value="Like" id="likecmt_${post_id}_${x++}" onclick="likeComment(this.id)" ` ;
            commentsArr.push(str);       
        }        
    }
    
        return commentsArr;
}

function getPosts() {
    var posts = new Promise((resolve, reject) => {
        resolve(jQuery.ajax({
            url: "https://jsonplaceholder.typicode.com/posts", success: function (data) {
                return data;
            }
        }));
    });
    return posts;
}

function getComments() {
    var comments = new Promise((resolve, reject) => {
        resolve(jQuery.ajax({
            url: "https://jsonplaceholder.typicode.com/comments", success: function (data) {
                return data;
            }
        }));
    });
    return comments;
}

function getUsers() {
    var users;
    var users = new Promise((resolve, reject) => {
        resolve(jQuery.ajax({
            url: "https://jsonplaceholder.typicode.com/users", success: function (data) {
                return data;
            }
        }));
    });
    return users;
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

var myEfficientFn = debounce(function() {
    currentPoint = window.scrollY;
   // console.log(currentPoint);
    if(currentPoint-300>latestPoint){
        if(len<=(Math.floor(jsonArray.length/10)*10)-10){
        len+=10;
        populateData();
        }
    }
    else{
           len=jsonArray.length;
           populateData();
           window.removeEventListener('scroll',myEfficientFn);  
            document.getElementById("message").innerHTML = "No more records";
       }
    if(currentPoint>latestPoint){
        latestPoint = currentPoint;
    }
}, 100);

window.addEventListener('scroll', myEfficientFn); 
