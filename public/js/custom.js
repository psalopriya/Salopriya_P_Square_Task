$(function () {
  // Empty cart on index.html
  if (window.location.pathname.endsWith("index.html")) {
    localStorage.removeItem("cart");
  }

  // Scroll Nav and Back‑To‑Top
  $(window).scroll(function () {
    if ($(this).scrollTop() < 50) {
      $("nav").removeClass("site-top-nav");
      $("#back-to-top").fadeOut();
    } else {
      $("nav").addClass("site-top-nav");
      $("#back-to-top").fadeIn();
    }
  });

  $("#back-to-top").click(function (event) {
    event.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, 1000);
  });

  // Toggle Cart
  $("#shopping-cart").on("click", function () {
    $("#cart-content").toggle("blind", "", 500);
  });

  // Load cart initially
  renderCart();

  // Add to Cart
  $(".food-menu-box form").on("submit", function (e) {
    e.preventDefault();

    const quantity = parseInt($(this).find('input[type="number"]').val(), 10);
    if (quantity <= 0) {
      alert("Please enter a quantity greater than 0.");
      return;
    }

    const foodName = $(this).find("h4").text();
    const priceText = $(this).find(".food-price").text().trim();
    const price = parseFloat(priceText.replace("₹", ""));
    const imgSrc = $(this).find(".food-menu-img img").attr("src");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingIndex = cart.findIndex(item => item.foodName === foodName);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].total = (cart[existingIndex].quantity * price).toFixed(2);
    } else {
      const newItem = {
        foodName,
        price,
        quantity,
        imgSrc,
        total: (price * quantity).toFixed(2)
      };
      cart.push(newItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  });

  // Delete from cart
  $(document).on("click", ".btn-delete", function (e) {
    e.preventDefault();
    const index = $(this).closest("tr").index();
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  });

  function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const $tbody = $("#cart-table tbody");
    $tbody.empty();

    cart.forEach((item, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td><img src="${item.imgSrc}" alt="${item.foodName}" style="width:50px; height:50px; object-fit:cover;"></td>
          <td>${item.foodName}</td>
          <td>₹${item.price.toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>₹${item.total}</td>
          <td><a href="#" class="btn-delete">&times;</a></td>
        </tr>
      `;
      $tbody.append(row);
    });

    updateTotal();
  }

  function updateTotal() {
    let sumQty = 0;
    let sumAmt = 0;

    $("#cart-table tbody tr").each(function () {
      const qty = parseInt($(this).find("td:nth-child(5)").text(), 10) || 0;
      const amt = parseFloat($(this).find("td:nth-child(6)").text().replace("₹", "")) || 0;
      sumQty += qty;
      sumAmt += amt;
    });

    $("#cart-total-qty").text(sumQty);
    $("#cart-total-amount").text(`₹${sumAmt.toFixed(2)}`);
  }

  // USER LOGIN MANAGEMENT
  const $form = $('#login-form');
  const $message = $('#login-message');
  const $userInfo = $('#user-info');
  const $userAvatar = $('#user-avatar');
  const $userName = $('#user-name');
  const $navUserIcon = $('#nav-user-icon');
  const $navUserLink = $('#user-icon');

  // Display user if already logged in
  const existingUser = JSON.parse(localStorage.getItem('user'));
  if (existingUser) {
    showUserInfo(existingUser);
  }

  $form.on('submit', function (e) {
    e.preventDefault();
    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    if (!name || !email || !password) {
      $message.text('Please fill in all fields.').css('color', 'red').fadeIn();
      setTimeout(() => { $message.fadeOut(); }, 3000);
      return;
    }

    const user = {
      name: name,
      initial: name.charAt(0).toUpperCase()
    };

    localStorage.setItem('user', JSON.stringify(user));
    showUserInfo(user);
    $message.text('Successfully Logged in').css('color', 'green').fadeIn();
    setTimeout(() => { $message.fadeOut(); }, 3000);
  });

  $('#logout-btn').on('click', function () {
    localStorage.removeItem('user');
    $userInfo.hide();
    $form.show();
    $navUserIcon.hide();
    $navUserLink.hide();
  });

  function showUserInfo(user) {
    $form.hide();
    $userAvatar.text(user.initial);
    $userName.text(`Welcome, ${user.name}`);
    $userInfo.show();

    // Update nav icon
    $navUserIcon.text(user.initial).css({
      display: 'flex',
      
    });

    $navUserLink.show();
  }
});
