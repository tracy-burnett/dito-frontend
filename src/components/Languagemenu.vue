<template>

<div class="dropdown1" style="float:right;">
  <button class="dropbtn1">Select Language 1</button>
  <div class="dropdown-content1">
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

<div class="dropdown2" style="float:right;">
  <button class="dropbtn2">Select Language 2</button>
  <div class="dropdown-content2">
  	  <a href="#">Language 1</a>
      <a href="#">Language 2</a>
      <a href="#">Language 3</a>
      <a href="#">Language 4</a>
  </div>
</div>

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

.dropdown-content a:hover {background-color: #f1f1f1;}
.dropdown:hover .dropdown-content {display: block;}
.dropdown:hover .dropbtn {background-color: #7833FF;}

</style>

