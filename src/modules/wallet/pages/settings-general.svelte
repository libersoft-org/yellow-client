<style>
 select {
  padding: 10px;
  font-family: inherit;
  font-size: inherit;
  border: 1px solid #000;
  border-radius: 10px;
  background-color: #fff;
 }

 .group {
  display: flex;
  flex-direction: column;
  gap: 5px;
 }

 .group .title {
  padding-left: 5px;
  font-weight: bold;
 }
</style>

<div class="group">
 <div class="title">Currency conversion:</div>
 <div class="select">
  <select>
   <option value="0">--- Select your currency ---</option>
   <option value="1">USD</option>
  </select>
 </div>
</div>
