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
