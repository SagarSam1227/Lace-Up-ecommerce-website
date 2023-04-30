
function deleteProduct(userId, proId) {
  console.log(proId, userId);

  $.ajax({
    url: "/delete-cart-Product",
    type: "POST",
    data: {
      userID: userId,
      proID: proId,
    },
    success: function (response) {
      if (response.status) {
        window.location.reload(true);
        $("#cart-card").remove();
      }
      console.log("success");
    },
  });
}

function updateNumber(id) {
  $.ajax({
    url: "/cart/" + id,
    type: "GET",
    success: (response) => {
      if (response.status) {
        // console.log(response.status);
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
        swal({
          title: "Successfully added",
          icon: "success",
        });
      } else {
        swal({
          title: "Already added!",
          icon: "info",
        });
      }
    },
  });
}

function countPlus(proId, quantity, x, price) {
  const count = Math.abs(parseInt(quantity) + parseInt(x));
  console.log(count);
  const subTotal = count * price;

  $.ajax({
    url: x == 1 ? "/plus-count/" + proId : "/minus-count/" + proId,
    type: "POST",
    data: {
      price: subTotal,
      count: count,
    },
    success: (response) => {
      if (response.status) {
        $("#" + proId).html(count);

        let subTotal = $("#id-" + proId).html();
        subTotal = count * price;
        $("#id-" + proId).html(subTotal);
        location.reload(true);
      } else {
        swal({
          title: "Out of stock!",
          icon: "error",
        });
      }
    },
  });
}

async function changeState(currState, orderId) {
  if (currState === "Cancel ?") {
    var reason


 await (async () => {

  /* inputOptions can be an object or Promise */
  const inputOptions = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        'I changed my mind': 'I changed my mind',
        'High Shipping costs' : 'High Shipping costs',
        'I bought the wrong item(s)': 'I bought the wrong item(s)',
        'I found a cheaper alternative': 'I found a cheaper alternative',
        'I placed a duplicate order': 'I placed a duplicate order',
        'Delivery takes too long': 'Delivery takes too long',
        'Other' : 'Other'
      })
    })
  })
  
  const { value: color } = await Swal.fire({
    title: 'Choose the reason',
    input: 'radio',
    inputOptions: inputOptions,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to choose something!'
      }
    }
  })
  
  if (color) {
    reason = color
    console.log(color);
    // Swal.fire({ html: `You selected: ${color}` })
    (async () => {
             const { value: text } = await Swal.fire({
    position: 'center',
    icon: 'success',
    title: 'Your order cancelled successfully',
    showConfirmButton: false,
    timer: 1500
  })
             if (text) {
              console.log(text);
            }
    })();


    $.ajax({
      url: "/change-status",
      type: "POST",
      data: {
        status: "Cancelled",
        orderId: orderId,
        reason:reason
      },
      success: (response) => {
        console.log(response.status);
    
        $("#status").html("Cancelled");
        $("#status-button").remove();
      },
    });



  }
  
  })()


console.log(reason,'okkkkk');




  } else {
    $.ajax({
      url: "/admin/change-status",
      type: "POST",
      data: {
        status: "Returned",
        orderId: orderId,
      },
      success: (response) => {
        console.log(response.status);

        $("#status").html("Returned");
        $("#status-button").remove();
      },
    });
  }
}

function payment(event) {
  event.preventDefault()
  const addressId = document.getElementById("address-id").value;
  const cashOnDeliveryRadio = document.getElementById("exampleRadios3");
  const paypalRadio = document.getElementById("exampleRadios4");
  const walletRadio = document.getElementById("exampleRadios5");

  let selectedPaymentOption;
  if (cashOnDeliveryRadio.checked) {
    selectedPaymentOption = cashOnDeliveryRadio.value;
  } else if (paypalRadio.checked) {
    selectedPaymentOption = paypalRadio.value;
  }else if(walletRadio.checked){
    selectedPaymentOption = walletRadio.value;
  }

  $.ajax({
    url: "/place-order",
    type: "POST",
    data: {
      payment_option: selectedPaymentOption,
      id: addressId,
    },
    success: (response) => {
      
      if (response.status =='COD') {
        if(response.coupon){
         
          location.href = "/success-coupon";

        }else{

          location.href = "/success";
        }
      } else if(response.status=='WALLET'){
        if(response.coupon){
         
          location.href = "/success-coupon";

        }else{

          location.href = "/success";
        }
      } else if(response.status =='EMPTY'){
        swal({
          icon: 'error',
          title: 'Sorry...',
          text: 'Your wallet does not have enough balance! try another way'
        })
      }else{
        console.log(response);
        razorpayPayment(response)
      }
    }
  });
}
function razorpayPayment(order){
  console.log(order);
    var options = {
        "key": "rzp_test_2Nt8hWDvPKHDDI", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Lace Up",
        "description": "Test Transaction",
        "image": "/assets/imgs/theme/lp.png",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){

            verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9000090000"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#32abb1"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response){
            alert(response.error.code);
            alert(response.error.description);
            alert(response.error.source);
            alert(response.error.step);
            alert(response.error.reason);
            alert(response.error.metadata.order_id);
            alert(response.error.metadata.payment_id);
    });
        rzp1.open();
}

function verifyPayment(payment,order){
    $.ajax({
        url:'/verify-payment',
        data:{
            payment,
            order
        },
        method:'POST',
        success:(response)=>{
          if(response.status){
            location.href = "/success";
          }else{
            alert('payment failed')
          }
        }
    })
}



function subcategoryList(cat){
      console.log(cat);

      $.ajax({
        url: "/get-subcategory",
        type: "POST",
        data: {
          category: cat,
        },
        success: (response) => {
          if (response) {
            console.log(response);
        
            const subUl = document.getElementById(`${cat}-cat`);
            const subUlmob = document.getElementById(`${cat}-cat-mob`)
            let list = ''
            response.forEach((item) => {
              list += `<li><a href="/subcategory-collection/obj?cat=${cat}&sub=${item}">${item}</a></li>`;

              
            });
            subUl.innerHTML= list
            subUlmob.innerHTML = list
          }
        },
      });
}




function applyCoupon(id,Total){
  const couponCode=document.getElementById('couponcode').value
  console.log(id);
  console.log(couponCode);

  $.ajax({
    url:'/apply-coupon',
    type:'POST',
    data:{
      id:id,
      couponCode:couponCode,
      totalAmount:Total
    },
    success:(response)=>{
      if(response.coupon){
        console.log(response.coupon);
        console.log(Total);
        const discount =(Total*response.coupon)/100
        const totalAmount=Math.floor(Total-discount)
        $('#dis-count').html('₹ '+discount)
        $('#total-amount').html('₹ '+totalAmount)
      }
    }
  })
}


