$( document ).ready(function() {
   
      
    /*global io*/
    var socket = io();
    
    // Form submittion with new message in field with id 'm'
    $('form').submit(function(){
      var messageToSend = $('#m').val();
      //send message to server here?
      socket.emit('chat message', messageToSend);
      $('#m').val('');
      return false; // prevent form submit from refreshing page
    });
    
  
    
    //When I log out and log back in the currentUsers count shows 2 even though there is only one person connected.  If I refresh the currentUsers resets
    
      socket.on('user', (data)=>{
        console.log(data)
        let message = data.name;
        document.getElementById("num-users").innerHTML = data.currentUsers + " users online";
        if(data.connected){
          message += " has joined the chat";
        } else {
          message += " has left the chat";
        }
  
        let li = document.createElement("li");
        li.innerHTML = message;
        document.getElementById("messages").appendChild(li)
      });
  
      socket.on('chat message', (data)=>{
        console.log(data.message, data.name);
        const messageData = data;
        const listEl = document.createElement("li");
        listEl.textContent = `${messageData.name}: ${messageData.message}`;
        document.getElementById("messages").appendChild(listEl);
      })
  
    
  });
  