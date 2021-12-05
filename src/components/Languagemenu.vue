<template>

<div class="dropdown" style="float:right;">
  <button class="dropbtn">Select Translation 1</button>
  <div class="dropdown-content">
  	  <a href="#">Language 1</a>
      <a href="#">Language 2</a>
      <a href="#">Language 3</a>
      <a href="#">Language 4</a>
  </div>
</div>
<br>
<br>
<br>
<br>

<div class="dropdown" style="float:right;">
  <button class="dropbtn">Select Translation 2</button>
  <div class="dropdown-content">
  	  <a href="#">Language 1</a>
      <a href="#">Language 2</a>
      <a href="#">Language 3</a>
      <a href="#">Language 4</a>
  </div>
</div>

<input onclick="makeMenu()" value="+" type= "button" class="buttonplus">


</template>

<script>
export default {
    name: 'Languagemenu',
    props: ["text"]
}
</script>

<style>
.dropbtn {

   background-color: #7833FF;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 16px;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.buttonplus {
background-color: #7833FF;
  border: none;
  color: white;
  padding: 9px 12px;
  position:fixed;
  left:600px;
  top:300px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 16px;
}

.buttonplus {border-radius: 100%;}

.dropdown-content a:hover {background-color: #f1f1f1;}
.dropdown:hover .dropdown-content {display: block;}
.dropdown:hover .dropbtn {background-color: #7833FF;}

</style>

