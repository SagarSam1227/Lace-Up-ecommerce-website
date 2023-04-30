function changeStatus(status, orderId) {

  $.ajax({
    url: "/admin/change-status",
    type: "POST",
    data: {
      status:status=='Cancel'? 'Cancelled': status,
      orderId: orderId,
    },
    success: (response) => {
      if(response.status){
        if(status=='Cancel'){

          $('#'+orderId).html('Cancelled')
          $("#drop-down-btn").remove();
        }
      else {
        console.log("status truee");
        $("#" + orderId).html(status);
      }
    }
    },
  });
}

function getSubcategory() {
  const category = document.getElementById("category").value;
  console.log('cat is : ',category);
  
  $.ajax({
    url: "/admin/get-subcategory",
    type: "POST",
    data: {
      category: category,
    },
    success: (response) => {
      if (response) {
        console.log(response);
        const subSelect = document.getElementById("sub-category");
        let option
        response.forEach((item) => {
          option += `<option value="${item}">${item}</option>`;
        });
        console.log(option);
        subSelect.innerHTML= option
      }
    },
  });
}




function filterOrder(){
  const fromDate = document.getElementById('from-date').value
  const toDate = document.getElementById('to-date').value


  console.log(typeof(fromDate),toDate);

  $.ajax({
    url:'/admin/filter-salesreprort',
    method:'POST',
    data:{
      fromDate:fromDate,
      toDate:toDate
    },
    success:(response)=>{
      if(response.data){
        console.log(response);
        const responseData = response.data
        let body=[]
        responseData.forEach((item)=>{
          body += `<tr>
          <td>${item.userId}</td>
          <td>${item._id}</td>
          <td>${item.orderDate}</td>
          <td>${paymentStatus(item.paymentMethod)}</td>
          <td>${item.status}</td>
          <td>₹ ${item.Total}</td>
        </tr>`
        })
        function paymentStatus(method){
          if(method ==='Cash on Delivery'){
            return 'COD'
          }
          else if(method ==='Wallet'){
            return 'Wallet'
          }else{
            return 'Online'
          }
        }
        
        
      document.getElementById('response-data').innerHTML = body;
      }
    }
  })
}