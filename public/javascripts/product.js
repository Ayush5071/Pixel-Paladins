
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
