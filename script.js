document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.querySelector('.preloader');
    const revealLines = document.querySelectorAll('.reveal-line');

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hide');
            setTimeout(() => {
                revealLines.forEach((line, index) => {
                    setTimeout(() => line.classList.add('active'), index * 180);
                });
                document.querySelectorAll('.reveal-fade').forEach((element) => element.classList.add('active'));
            }, 350);
        }, 850);
    });

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    if (hasFinePointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('mousemove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        function animateCursor() {
            outlineX += (mouseX - outlineX) * 0.14;
            outlineY += (mouseY - outlineY) * 0.14;
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    const progressBar = document.querySelector('.page-progress');
    const heroFrame = document.querySelector('.parallax-frame');

    window.addEventListener('scroll', () => {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = height > 0 ? window.scrollY / height : 0;
        progressBar.style.transform = `scaleX(${progress})`;
    }, { passive: true });

    window.addEventListener('mousemove', (event) => {
        document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
        document.documentElement.style.setProperty('--my', `${event.clientY}px`);

        if (heroFrame && window.innerWidth > 900) {
            const rect = heroFrame.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            heroFrame.style.transform = `perspective(1200px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
        }
    });

    const ambientCanvas = document.getElementById('ambient-canvas');
    const context = ambientCanvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        ambientCanvas.width = window.innerWidth * ratio;
        ambientCanvas.height = window.innerHeight * ratio;
        ambientCanvas.style.width = `${window.innerWidth}px`;
        ambientCanvas.style.height = `${window.innerHeight}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        particles = Array.from({ length: window.innerWidth < 700 ? 10 : 22 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: Math.random() * 2 + .8,
            speed: Math.random() * .12 + .04,
            drift: (Math.random() - .5) * .08,
            alpha: Math.random() * .22 + .06
        }));
    }

    function drawParticles() {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles.forEach((particle) => {
            particle.y -= particle.speed;
            particle.x += particle.drift;
            if (particle.y < -10) {
                particle.y = window.innerHeight + 10;
                particle.x = Math.random() * window.innerWidth;
            }
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(179, 111, 130, ${particle.alpha})`;
            context.fill();
        });
        requestAnimationFrame(drawParticles);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        drawParticles();
    }

    const revealTargets = document.querySelectorAll('.section-header, .cake-card');
    revealTargets.forEach((target) => target.classList.add('scroll-reveal'));
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealTargets.forEach((target, index) => {
        target.style.transitionDelay = `${(index % 3) * 90}ms`;
        revealObserver.observe(target);
    });

    const magneticBtn = document.querySelector('.magnetic-btn');
    if (magneticBtn) {
        magneticBtn.addEventListener('mousemove', (event) => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            magneticBtn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
        });
        magneticBtn.addEventListener('mouseleave', () => {
            magneticBtn.style.transform = 'translate(0, 0)';
        });
    }

    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total-price');
    const toastEl = document.getElementById('toast');
    let cart = [];

    function showToast(message) {
        toastEl.textContent = message;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2300);
    }

    function toggleCart(open) {
        cartDrawer.classList.toggle('active', open);
        cartOverlay.classList.toggle('active', open);
    }

    openCartBtn.addEventListener('click', () => toggleCart(true));
    closeCartBtn.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));

    function updateCartUI() {
        cartCountEl.textContent = cart.length;
        document.getElementById('admin-cart-count').textContent = cart.length;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">ยังไม่มีรายการขนมในตะกร้า</p>';
            cartTotalEl.textContent = '฿0';
            document.getElementById('admin-cart-total').textContent = '฿0';
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
            total += item.price;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div>
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">฿${item.price.toLocaleString()}</div>
                </div>
                <button class="remove-item" data-index="${index}">ลบ</button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
        cartTotalEl.textContent = `฿${total.toLocaleString()}`;
        document.getElementById('admin-cart-total').textContent = `฿${total.toLocaleString()}`;

        document.querySelectorAll('.remove-item').forEach((button) => {
            button.addEventListener('click', () => {
                cart.splice(Number(button.dataset.index), 1);
                updateCartUI();
            });
        });
    }

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('กรุณาเลือกขนมเค้กก่อนสั่งซื้อ');
            return;
        }
        alert('ขอบคุณสำหรับการสั่งซื้อ! ทีมงานกำลังเตรียมจัดส่งความอร่อยให้คุณ');
        cart = [];
        updateCartUI();
        toggleCart(false);
    });

    const defaultProducts = [
        {
            name: 'Noir et Fraise',
            price: 1450,
            description: 'สปันจ์วานิลลามาดากัสการ์ สลับชั้นครีมสดฮอกไกโดและสตรอว์เบอร์รีออร์แกนิก',
            image: 'images/noir-et-fraise.png',
            category: 'Fruit'
        },
        {
            name: 'L’Or Salted Caramel',
            price: 1690,
            description: 'มูสช็อกโกแลต 70% สอดไส้ซอลท์เท็ดคาราเมลโฮมเมด ตกแต่งทองคำเปลวบริสุทธิ์',
            image: 'images/lor-salted-caramel.png',
            category: 'Chocolate'
        },
        {
            name: 'Uji Matcha Opera',
            price: 1550,
            description: 'เค้กโอเปร่า 7 เลเยอร์ ผสานมัทฉะเกรดพิธีการจากเมืองอุจิและอัลมอนด์อบกรอบ',
            image: 'images/uji-matcha-opera.png',
            category: 'Tea'
        },
        {
            name: 'Vanilla Fleur',
            price: 1380,
            description: 'เค้กวานิลลาบัวหิมะ ซอสคัสตาร์ดและครีมสดเนื้อเนียนละเอียด',
            image: 'images/vanilla-fleur.png',
            category: 'Cake'
        },
        {
            name: 'Pistachio Rose',
            price: 1590,
            description: 'มูสพิสทาชิโอ โรสคอมพอตและเกล็ดอัลมอนด์อบกรอบ',
            image: 'images/pistachio-rose.png',
            category: 'Cake'
        },
        {
            name: 'Berry Pavlova',
            price: 1290,
            description: 'เมอริงค์กรอบนุ่ม ราดครีมวานิลลาและเบอร์รีผลไม้สด',
            image: 'images/berry-pavlova.png',
            category: 'Fruit'
        },
        {
            name: 'Midnight Chocolate',
            price: 1750,
            description: 'ช็อกโกแลตดาร์ก 72% เจลาโตโกโก้และไอซิ่งเนียนประกาย',
            image: 'images/midnight-chocolate.png',
            category: 'Chocolate'
        },
        {
            name: 'Hojicha Cloud',
            price: 1490,
            description: 'โฮจิฉะโรสต์อบอุ่น เสิร์ฟกับครีมชีสไลท์และแบล็กซีซาม',
            image: 'images/hojicha-cloud.png',
            category: 'Tea'
        },
        {
            name: 'Petite Celebration',
            price: 890,
            description: 'ชุดมินิเค้ก 6 ชิ้น ผสมรสสำหรับรับแขกและของขวัญเล็กๆ',
            image: 'images/petite-celebration.png',
            category: 'Mini'
        },
        {
            name: 'เค้กช็อกโกแลตชิ้นเล็ก',
            price: 35,
            description: 'เค้กช็อกโกแลตเนื้อนุ่ม ขนาดพอดีทานระหว่างวัน',
            image: 'images/student-chocolate-slice.png',
            category: 'Cake',
            studentFriendly: true
        },
        {
            name: 'เค้กวานิลลาชิ้นเล็ก',
            price: 30,
            description: 'เค้กวานิลลาหอมละมุน เสิร์ฟเป็นชิ้นเดี่ยวในราคาสบายกระเป๋า',
            image: 'images/student-vanilla-slice.png',
            category: 'Cake',
            studentFriendly: true
        },
        {
            name: 'เค้กสตรอว์เบอร์รีชิ้นเล็ก',
            price: 45,
            description: 'เค้กครีมสดและสตรอว์เบอร์รี ขนาดชิ้นเดี่ยว',
            image: 'images/student-strawberry-slice.png',
            category: 'Cake',
            studentFriendly: true
        },
        {
            name: 'เค้กมัทฉะชิ้นเล็ก',
            price: 40,
            description: 'เค้กมัทฉะหอมเข้ม ขนาดพอดีทาน',
            image: 'images/student-matcha-slice.png',
            category: 'Cake',
            studentFriendly: true
        },
        {
            name: 'ชาไทยเย็น',
            price: 25,
            description: 'ชาไทยหอมเข้ม หวานมันกำลังดี เสิร์ฟแก้วเดี่ยว',
            image: 'images/student-thai-tea.png',
            category: 'Drink',
            studentFriendly: true
        },
        {
            name: 'ชาเขียวนมเย็น',
            price: 30,
            description: 'ชาเขียวหอมละมุนผสมนมสด แก้วเดี่ยวราคาประหยัด',
            image: 'images/student-green-tea.png',
            category: 'Drink',
            studentFriendly: true
        },
        {
            name: 'โกโก้เย็น',
            price: 35,
            description: 'โกโก้เข้มข้น หวานพอดี เสิร์ฟเย็นชื่นใจ',
            image: 'images/student-cocoa-drink.png',
            category: 'Drink',
            studentFriendly: true
        },
        {
            name: 'คุกกี้ช็อกโกแลตชิป',
            price: 25,
            description: 'คุกกี้อบหอมกรอบนอกนุ่มใน ใส่ช็อกโกแลตชิปเต็มคำ',
            image: 'images/snack-cookie-chocolate-chip.png',
            category: 'Snack',
            studentFriendly: true
        },
        {
            name: 'บราวนี่ชิ้นจิ๋ว',
            price: 30,
            description: 'บราวนี่ช็อกโกแลตเนื้อหนึบ ขนาดพอดีทานเล่น',
            image: 'images/snack-brownie-mini.png',
            category: 'Snack',
            studentFriendly: true
        },
        {
            name: 'ครัวซองต์เนยชิ้นเล็ก',
            price: 35,
            description: 'ครัวซองต์เนยหอม อบกรอบนอกนุ่มใน',
            image: 'images/snack-butter-croissant.png',
            category: 'Snack',
            studentFriendly: true
        },
        {
            name: 'ขนมปังกระเทียม',
            price: 20,
            description: 'ขนมปังกรอบทาเนยกระเทียมหอม ๆ เคี้ยวเพลิน',
            image: 'images/snack-garlic-bread-photo.png',
            category: 'Snack',
            studentFriendly: true
        },
        {
            name: 'ป๊อปคอร์นคาราเมล',
            price: 20,
            description: 'ป๊อปคอร์นเคลือบคาราเมล หวานกรอบพอดีคำ',
            image: 'images/snack-caramel-popcorn.png',
            category: 'Snack',
            studentFriendly: true
        },
        {
            name: 'มัฟฟินกล้วยหอม',
            price: 25,
            description: 'มัฟฟินกล้วยหอมอบสด เนื้อนุ่มหอมละมุน',
            image: 'images/snack-banana-muffin-photo.png',
            category: 'Snack',
            studentFriendly: true
        },
        {
            name: 'แซนด์วิชแฮมชีส',
            price: 30,
            description: 'ขนมปังปิ้งไส้แฮมชีส อิ่มง่ายในราคาสบายกระเป๋า',
            image: 'images/snack-ham-cheese-photo.png',
            category: 'Snack',
            studentFriendly: true
        },
        {
            name: 'Roseberry Fizz',
            price: 290,
            description: 'สปาร์คลิงกุหลาบผลเบอร์รี่ โรยด้วยน้ำเชื่อมไวท์ช็อกโกแลต',
            image: 'images/roseberry-fizz.png',
            category: 'Drink'
        },
        {
            name: 'Uji Matcha Latte',
            price: 260,
            description: 'มัทฉะอุจิเข้มข้น ผสมนมสดและโฟมมัทฉะละมุน',
            image: 'images/uji-matcha-latte.png',
            category: 'Drink'
        },
        {
            name: 'Peach Oolong',
            price: 220,
            description: 'ชาหอมอูหลงกลิ่นพีชและน้ำผึ้งดอกไม้อ่อน',
            image: 'images/peach-oolong.png',
            category: 'Drink'
        },
        {
            name: 'Cocoa Noir',
            price: 280,
            description: 'โกโก้ 70% เข้มละมุน ตกแต่งด้วยมาร์ชเมลโลว์',
            image: 'images/cocoa-noir.png',
            category: 'Drink'
        },
        {
            name: 'Citrus Garden',
            price: 240,
            description: 'เลมอนเคลือบเกล็ดน้ำตาล มะนาวโซดาและใบสะระแหน่',
            image: 'images/citrus-garden.png',
            category: 'Drink'
        }
    ];

    const storedProducts = JSON.parse(localStorage.getItem('latelier-products') || 'null');
    let updatedStoredProducts = false;
    let products = storedProducts && storedProducts.length >= 6
        ? [
            ...storedProducts,
            ...defaultProducts.filter((product) =>
                (product.category === 'Drink' || product.category === 'Snack' || product.studentFriendly) &&
                !storedProducts.some((stored) => stored.name === product.name)
            )
        ]
        : defaultProducts;

    if (storedProducts && products.length !== storedProducts.length) updatedStoredProducts = true;
    products = products.map((product) => {
        if (product.name === 'คุกกี้ช็อกโกแลตชิป') {
            if (product.image !== 'images/snack-cookie-chocolate-chip.png') updatedStoredProducts = true;
            return { ...product, image: 'images/snack-cookie-chocolate-chip.png' };
        }
        if (product.name === 'บราวนี่ชิ้นจิ๋ว') {
            if (product.image !== 'images/snack-brownie-mini.png') updatedStoredProducts = true;
            return { ...product, image: 'images/snack-brownie-mini.png' };
        }
        if (product.name === 'ครัวซองต์เนยชิ้นเล็ก') {
            if (product.image !== 'images/snack-butter-croissant.png') updatedStoredProducts = true;
            return { ...product, image: 'images/snack-butter-croissant.png' };
        }
        if (product.name === 'ขนมปังกระเทียม') {
            if (product.image !== 'images/snack-garlic-bread-photo.png') updatedStoredProducts = true;
            return { ...product, image: 'images/snack-garlic-bread-photo.png' };
        }
        if (product.name === 'ป๊อปคอร์นคาราเมล') {
            if (product.image !== 'images/snack-caramel-popcorn.png') updatedStoredProducts = true;
            return { ...product, image: 'images/snack-caramel-popcorn.png' };
        }
        if (product.name === 'มัฟฟินกล้วยหอม') {
            if (product.image !== 'images/snack-banana-muffin-photo.png') updatedStoredProducts = true;
            return { ...product, image: 'images/snack-banana-muffin-photo.png' };
        }
        if (product.name === 'แซนด์วิชแฮมชีส') {
            if (product.image !== 'images/snack-ham-cheese-photo.png') updatedStoredProducts = true;
            return { ...product, image: 'images/snack-ham-cheese-photo.png' };
        }
        if (product.name === 'Noir et Fraise') {
            if (product.image !== 'images/noir-et-fraise.png') updatedStoredProducts = true;
            return { ...product, image: 'images/noir-et-fraise.png' };
        }
        if (product.name === 'L’Or Salted Caramel') {
            if (product.image !== 'images/lor-salted-caramel.png') updatedStoredProducts = true;
            return { ...product, image: 'images/lor-salted-caramel.png' };
        }
        if (product.name === 'Uji Matcha Opera') {
            if (product.image !== 'images/uji-matcha-opera.png') updatedStoredProducts = true;
            return { ...product, image: 'images/uji-matcha-opera.png' };
        }
        if (product.name === 'Vanilla Fleur') {
            if (product.image !== 'images/vanilla-fleur.png') updatedStoredProducts = true;
            return { ...product, image: 'images/vanilla-fleur.png' };
        }
        if (product.name === 'Pistachio Rose') {
            if (product.image !== 'images/pistachio-rose.png') updatedStoredProducts = true;
            return { ...product, image: 'images/pistachio-rose.png' };
        }
        if (product.name === 'Berry Pavlova') {
            if (product.image !== 'images/berry-pavlova.png') updatedStoredProducts = true;
            return { ...product, image: 'images/berry-pavlova.png' };
        }
        if (product.name === 'Midnight Chocolate') {
            if (product.image !== 'images/midnight-chocolate.png') updatedStoredProducts = true;
            return { ...product, image: 'images/midnight-chocolate.png' };
        }
        if (product.name === 'Hojicha Cloud') {
            if (product.image !== 'images/hojicha-cloud.png') updatedStoredProducts = true;
            return { ...product, image: 'images/hojicha-cloud.png' };
        }
        if (product.name === 'Petite Celebration') {
            if (product.image !== 'images/petite-celebration.png') updatedStoredProducts = true;
            return { ...product, image: 'images/petite-celebration.png' };
        }
        if (product.name === 'เค้กช็อกโกแลตชิ้นเล็ก') {
            if (product.image !== 'images/student-chocolate-slice.png') updatedStoredProducts = true;
            return { ...product, image: 'images/student-chocolate-slice.png' };
        }
        if (product.name === 'เค้กวานิลลาชิ้นเล็ก') {
            if (product.image !== 'images/student-vanilla-slice.png') updatedStoredProducts = true;
            return { ...product, image: 'images/student-vanilla-slice.png' };
        }
        if (product.name === 'เค้กสตรอว์เบอร์รีชิ้นเล็ก') {
            if (product.image !== 'images/student-strawberry-slice.png') updatedStoredProducts = true;
            return { ...product, image: 'images/student-strawberry-slice.png' };
        }
        if (product.name === 'เค้กมัทฉะชิ้นเล็ก') {
            if (product.image !== 'images/student-matcha-slice.png') updatedStoredProducts = true;
            return { ...product, image: 'images/student-matcha-slice.png' };
        }
        if (product.name === 'ชาไทยเย็น') {
            if (product.image !== 'images/student-thai-tea.png') updatedStoredProducts = true;
            return { ...product, image: 'images/student-thai-tea.png' };
        }
        if (product.name === 'ชาเขียวนมเย็น') {
            if (product.image !== 'images/student-green-tea.png') updatedStoredProducts = true;
            return { ...product, image: 'images/student-green-tea.png' };
        }
        if (product.name === 'โกโก้เย็น') {
            if (product.image !== 'images/student-cocoa-drink.png') updatedStoredProducts = true;
            return { ...product, image: 'images/student-cocoa-drink.png' };
        }
        if (product.name === 'Roseberry Fizz') {
            if (product.image !== 'images/roseberry-fizz.png') updatedStoredProducts = true;
            return { ...product, image: 'images/roseberry-fizz.png' };
        }
        if (product.name === 'Uji Matcha Latte') {
            if (product.image !== 'images/uji-matcha-latte.png') updatedStoredProducts = true;
            return { ...product, image: 'images/uji-matcha-latte.png' };
        }
        if (product.name === 'Peach Oolong') {
            if (product.image !== 'images/peach-oolong.png') updatedStoredProducts = true;
            return { ...product, image: 'images/peach-oolong.png' };
        }
        if (product.name === 'Cocoa Noir') {
            if (product.image !== 'images/cocoa-noir.png') updatedStoredProducts = true;
            return { ...product, image: 'images/cocoa-noir.png' };
        }
        if (product.name === 'Citrus Garden') {
            if (product.image !== 'images/citrus-garden.png') updatedStoredProducts = true;
            return { ...product, image: 'images/citrus-garden.png' };
        }
        return product;
    });
    if (storedProducts && updatedStoredProducts) {
        localStorage.setItem('latelier-products', JSON.stringify(products));
    }

    function bindHoverCursor() {
        if (!hasFinePointer) return;
        document.querySelectorAll('a, button, .cake-card').forEach((target) => {
            target.addEventListener('mouseenter', () => cursorOutline.classList.add('hovering'));
            target.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovering'));
        });
    }

    let activeCategory = 'All';

    function renderProducts() {
        const grid = document.getElementById('cake-grid');
        grid.innerHTML = '';
        products.forEach((product) => {
            const category = product.category || 'Cake';
            if (category === 'Drink' || category === 'Snack') return;
            if (activeCategory !== 'All' && category !== activeCategory) return;
            const card = document.createElement('article');
            card.className = 'cake-card tilt-card';
            card.innerHTML = `
                <div class="card-image-wrap">
                    <img src="${product.image}" alt="${product.name}" loading="eager">
                    <button class="quick-add hover-target" data-name="${product.name}" data-price="${product.price}">
                        + เพิ่มลงตะกร้า
                    </button>
                </div>
                <div class="card-info">
                    <span class="card-category">${category}</span>
                    <div class="card-meta">
                        <h3>${product.name}</h3>
                        <span class="price">฿${Number(product.price).toLocaleString()}</span>
                    </div>
                    <p>${product.description}</p>
                </div>
            `;
            grid.appendChild(card);

            card.addEventListener('mousemove', (event) => {
                if (window.innerWidth <= 900) return;
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                card.style.transform = `perspective(1000px) rotateX(${(y / rect.height) * -4}deg) rotateY(${(x / rect.width) * 4}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        });

        grid.querySelectorAll('.quick-add').forEach((button) => {
            button.addEventListener('click', () => {
                cart.push({
                    name: button.dataset.name,
                    price: Number(button.dataset.price)
                });
                updateCartUI();
                showToast(`เพิ่ม "${button.dataset.name}" ลงในตะกร้าแล้ว`);
            });
        });
        document.getElementById('admin-product-count').textContent = products.length;
        renderDrinks();
        renderSnacks();
        bindHoverCursor();
    }

    function renderDrinks() {
        const grid = document.getElementById('drinks-grid');
        grid.innerHTML = '';
        products.filter((product) => (product.category || 'Cake') === 'Drink').forEach((product) => {
            const card = document.createElement('article');
            card.className = 'cake-card drink-card tilt-card';
            card.innerHTML = `
                <div class="card-image-wrap">
                    <img src="${product.image}" alt="${product.name}" loading="eager">
                    <button class="quick-add hover-target" data-name="${product.name}" data-price="${product.price}">
                        + เพิ่มลงตะกร้า
                    </button>
                </div>
                <div class="card-info">
                    <span class="card-category">Drinks</span>
                    <div class="card-meta">
                        <h3>${product.name}</h3>
                        <span class="price">฿${Number(product.price).toLocaleString()}</span>
                    </div>
                    <p>${product.description}</p>
                </div>
            `;
            grid.appendChild(card);

            card.addEventListener('mousemove', (event) => {
                if (window.innerWidth <= 900) return;
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                card.style.transform = `perspective(1000px) rotateX(${(y / rect.height) * -4}deg) rotateY(${(x / rect.width) * 4}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        });
        grid.querySelectorAll('.quick-add').forEach((button) => {
            button.addEventListener('click', () => {
                cart.push({
                    name: button.dataset.name,
                    price: Number(button.dataset.price)
                });
                updateCartUI();
                showToast(`เพิ่ม "${button.dataset.name}" ลงในตะกร้าแล้ว`);
            });
        });
    }

    function renderSnacks() {
        const grid = document.getElementById('snacks-grid');
        grid.innerHTML = '';
        products.filter((product) => product.category === 'Snack').forEach((product) => {
            const card = document.createElement('article');
            card.className = 'cake-card snack-card tilt-card';
            card.innerHTML = `
                <div class="card-image-wrap">
                    <img src="${product.image}" alt="${product.name}" loading="eager">
                    <button class="quick-add hover-target" data-name="${product.name}" data-price="${product.price}">
                        + เพิ่มลงตะกร้า
                    </button>
                </div>
                <div class="card-info">
                    <span class="card-category">ของกินเล่น</span>
                    <div class="card-meta">
                        <h3>${product.name}</h3>
                        <span class="price">฿${Number(product.price).toLocaleString()}</span>
                    </div>
                    <p>${product.description}</p>
                </div>
            `;
            grid.appendChild(card);

            card.addEventListener('mousemove', (event) => {
                if (window.innerWidth <= 900) return;
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                card.style.transform = `perspective(1000px) rotateX(${(y / rect.height) * -4}deg) rotateY(${(x / rect.width) * 4}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        });
        grid.querySelectorAll('.quick-add').forEach((button) => {
            button.addEventListener('click', () => {
                cart.push({
                    name: button.dataset.name,
                    price: Number(button.dataset.price)
                });
                updateCartUI();
                showToast(`เพิ่ม "${button.dataset.name}" ลงในตะกร้าแล้ว`);
            });
        });
    }

    document.querySelectorAll('.menu-filter').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.menu-filter').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            activeCategory = button.dataset.filter;
            renderProducts();
        });
    });

    function renderAdminProducts() {
        const container = document.getElementById('admin-products');
        container.innerHTML = '';
        products.forEach((product, index) => {
            const item = document.createElement('article');
            item.className = 'admin-product';
            item.innerHTML = `
                <img src="${product.image}" alt="" loading="eager">
                <div>
                    <div class="admin-product-name">${product.name}</div>
                    <div class="admin-product-price">฿${Number(product.price).toLocaleString()}</div>
                </div>
                <div class="admin-product-actions">
                    <button type="button" data-edit="${index}">แก้ไข</button>
                    <button type="button" data-delete="${index}">ลบ</button>
                </div>
            `;
            container.appendChild(item);
        });

        container.querySelectorAll('[data-edit]').forEach((button) => {
            button.addEventListener('click', () => openEditor(Number(button.dataset.edit)));
        });
        container.querySelectorAll('[data-delete]').forEach((button) => {
            button.addEventListener('click', () => {
                if (!confirm(`ลบสินค้า "${products[Number(button.dataset.delete)].name}" หรือไม่?`)) return;
                products.splice(Number(button.dataset.delete), 1);
                saveProducts();
            });
        });
    }

    function saveProducts() {
        localStorage.setItem('latelier-products', JSON.stringify(products));
        renderProducts();
        renderAdminProducts();
        showToast('บันทึกข้อมูลเรียบร้อยแล้ว');
    }

    const adminPanel = document.getElementById('admin-panel');
    const adminOverlay = document.getElementById('admin-overlay');
    const adminLogin = document.getElementById('admin-login');
    const adminDashboard = document.getElementById('admin-dashboard');

    function toggleAdmin(open) {
        adminPanel.classList.toggle('active', open);
        adminOverlay.classList.toggle('active', open);
    }

    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    function toggleNav(open) {
        navLinks.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'ปิดเมนูนำทาง' : 'เปิดเมนูนำทาง');
    }

    menuToggle.addEventListener('click', () => {
        toggleNav(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => toggleNav(false));
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') toggleNav(false);
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) toggleNav(false);
    });

    document.getElementById('open-admin').addEventListener('click', () => toggleAdmin(true));
    document.getElementById('close-admin').addEventListener('click', () => toggleAdmin(false));
    adminOverlay.addEventListener('click', () => toggleAdmin(false));

    document.getElementById('toggle-password').addEventListener('click', (event) => {
        const password = document.getElementById('admin-password');
        const show = password.type === 'password';
        password.type = show ? 'text' : 'password';
        event.target.textContent = show ? 'ซ่อน' : 'แสดง';
    });

    async function passwordHash(value) {
        const bytes = new TextEncoder().encode(value);
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const password = document.getElementById('admin-password').value;
        const hash = await passwordHash(password);
        if (hash === 'a814b306936219bfd001b13dba4bb69b2adbc4a2cbe6e7b94b9596b68b297668') {
            adminLogin.classList.add('hidden');
            adminDashboard.classList.add('visible');
            document.getElementById('admin-password').value = '';
            document.getElementById('login-error').classList.remove('visible');
            renderAdminProducts();
        } else {
            document.getElementById('login-error').classList.add('visible');
        }
    });

    document.getElementById('admin-logout').addEventListener('click', () => {
        adminDashboard.classList.remove('visible');
        adminLogin.classList.remove('hidden');
    });

    const editor = document.getElementById('product-editor');
    function openEditor(index = -1) {
        document.getElementById('edit-index').value = index;
        document.getElementById('editor-title').textContent = index >= 0 ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่';
        if (index >= 0) {
            const product = products[index];
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-image').value = product.image;
            document.getElementById('product-category').value = product.category || 'Cake';
        } else {
            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
            document.getElementById('product-description').value = '';
            document.getElementById('product-image').value = '';
            document.getElementById('product-category').value = 'Cake';
        }
        editor.classList.add('visible');
        editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    document.getElementById('add-product').addEventListener('click', () => openEditor());
    document.getElementById('cancel-edit').addEventListener('click', () => editor.classList.remove('visible'));
    document.getElementById('product-editor').addEventListener('submit', (event) => {
        event.preventDefault();
        const index = Number(document.getElementById('edit-index').value);
        const product = {
            name: document.getElementById('product-name').value.trim(),
            price: Number(document.getElementById('product-price').value),
            description: document.getElementById('product-description').value.trim(),
            image: document.getElementById('product-image').value.trim(),
            category: document.getElementById('product-category').value
        };
        if (index >= 0) products[index] = product;
        else products.push(product);
        editor.classList.remove('visible');
        saveProducts();
    });

    renderProducts();
    updateCartUI();
    bindHoverCursor();
});
