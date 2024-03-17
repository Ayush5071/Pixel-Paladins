
// Add to Cart
document.querySelectorAll('.add-to-cart').forEach(function (link) {
    link.addEventListener('click', function (event) {
        event.preventDefault();
        const productId = this.getAttribute('data-productid');
        fetch(`/add-to-cart/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add product to cart');
                }
                console.log('Product added to cart successfully');
            })
            .catch(error => {
                console.error('Error adding product to cart:', error.message);
            });
    });
});

// Remove from Cart
document.querySelectorAll('.remove-from-cart').forEach(function (link) {
    link.addEventListener('click', function (event) {
        event.preventDefault();
        const productId = this.getAttribute('data-productid');
        fetch(`/remove-from-cart/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to remove product from cart');
                }
                console.log('Product removed from cart successfully');
            })
            .catch(error => {
                console.error('Error removing product from cart:', error.message);
            });
    });
});
const search = () => {
    const searchbox = document.getElementById("filter").value.toUpperCase();
    const filterType = document.getElementById("filter-type").value;
    const products = document.querySelectorAll("#products .product");

    products.forEach(product => {
        const dataElement = product.querySelector(`.${filterType}`);
        if (dataElement) {
            let textvalue = dataElement.textContent || dataElement.innerHTML;
            if (textvalue.toUpperCase().indexOf(searchbox) > -1) {
                product.style.display = "";
            } else {
                product.style.display = "none";
            }
        }
    });
}
document.getElementById("filter").addEventListener("input", search);
document.getElementById("filter-type").addEventListener("change", search);



