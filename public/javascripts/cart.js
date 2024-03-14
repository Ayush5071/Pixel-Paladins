const removeButtons = document.querySelectorAll('.remove-from-cart');

removeButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
        event.preventDefault();
        const productId = button.getAttribute('data-productid');

        try {
            const url = `/removefromcart/${productId}`;
            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (response.ok) {
                button.closest('.product').remove();
            } else {
                console.error('Failed to remove item from cart');
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    });
});
