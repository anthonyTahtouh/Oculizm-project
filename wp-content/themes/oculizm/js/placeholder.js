var client;
var category;
var orders = [];
var orderId;
var order;
var h2Element;
var sampleDataButton = `<div class="label-sample-data">SAMPLE DATA</div>`;

var ReviewsSummary = generateReviewsSummary();

// Function to generate random orders data with a curve starting and ending at the lowest point
function generateRandomOrdersData() {
    let currencies = ["GBP", "USD", "SEK"];
    let ordersData = {};

    // Generate random orders data for each currency
    currencies.forEach((currency, index) => {
        ordersData[currency] = {};
        let dateStrings = generateDateStrings().reverse(); // Reversing the date strings array
        for (let i = 0; i < 30; i++) {
            let date = dateStrings[i];
            ordersData[currency][date] = Math.round(Math.floor(Math.random() * 71));
        }
    });

    return ordersData;
}

// Function to generate random revenue data with a curve
function generateRandomRevenueData() {
    let currencies = ["GBP", "USD", "SEK"];
    let revenueData = {};

    // Generate random revenue data for each currency
    currencies.forEach((currency, index) => {
        revenueData[currency] = {};
        let dateStrings = generateDateStrings().reverse(); // Reversing the date strings array
        for (let i = 0; i < 30; i++) {
            let date = dateStrings[i];
            revenueData[currency][date] = Math.round(Math.floor(Math.random() * 501));
        }
    });

    return revenueData;
}


// Function to generate date strings for the last 30 days
function generateDateStrings() {
    let dateStrings = [];
    let currentDate = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < 30; i++) {
        let day = currentDate.getDate().toString().padStart(2, '0');
        let month = monthNames[currentDate.getMonth()];
        let year = currentDate.getFullYear().toString();
        let dateString = `${day} ${month} ${year}`;
        dateStrings.push(dateString);
        currentDate.setDate(currentDate.getDate() - 1); // Subtract one day
    }
    return dateStrings.reverse(); // Reverse the array to have dates in ascending order
}

// Function to generate random views data with a curve
function generateRandomViewsData() {
    let views = [["Date", "Shoppable Gallery"]];
    let dateStrings = generateDateStrings();

    for (let i = 0; i < dateStrings.length; i++) {
        let date = dateStrings[i];
        let value = Math.floor(Math.random() * 71);
        views.push([date, value]);
    }

    return views;
}

// Function to create the chart
const createChart = (chartData) => {
    const myChart = new Chart(document.querySelector(".reviews-by-rating-chart"), {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data
            }]
        },
        options: {
            borderWidth: 10,
            borderRadius: 2,
            hoverBorderWidth: 0,
            plugins: {
                legend: {
                    display: false,
                },
            },
        }
    });

    // Populate the details
    populateUl(myChart, chartData);
};

// Function to populate the details
const populateUl = (myChart, chartData) => {
    const ul = document.querySelector(".reviews-by-rating-stats .details ul");

    chartData.labels.forEach((label, i) => {
        let li = document.createElement("li");
        li.innerHTML = `${label} - <span class='percentage'>${chartData.data[i]}</span>`;
        li.classList.add(`star${i + 1}`);
        ul.appendChild(li);
    });

    // Loop through each segment and set the color dynamically
    myChart.data.labels.forEach((label, i) => {
        const color = myChart.data.datasets[0].backgroundColor[i];
        const bullet = document.querySelector(`.star${i + 1}`);
        bullet.style.setProperty('--bullet-color', color);
    });
};

// Function to populate the latest reviews
function generateLatestReviews() {
    const latestReviews = [];
    const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomDate = () => {
        const currentDate = new Date();
        const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        return new Date(oneMonthAgo.getTime() + Math.random() * (currentDate.getTime() - oneMonthAgo.getTime()));
    };

    const generateUniqueTitles = (category) => {
        const titles = [];
        switch (category) {
            case "apparel":
                titles.push("Stylish Clothing Picks", "Comfortable Fashion Finds", "Quality Wardrobe Essentials", "Trendy Apparel Collection");
                break;
            case "beautyAndCosmetics":
                titles.push("Gorgeous Makeup Selection", "Beauty Essentials Must-Have", "Cosmetic Wonders Unveiled", "Makeup Magic Unleashed");
                break;
            case "cycles":
                titles.push("Smooth Ride Adventure", "Durable Bike Companion", "Outdoor Cycling Bliss", "Stylish Bicycle Journeys");
                break;
            case "electronics":
                titles.push("Sleek Tech Marvels", "Innovative Gadget Finds", "High-Tech Delights Unveiled", "Electronics Excellence Unleashed");
                break;
            case "foodAndDrink":
                titles.push("Tasty Delightful Treats", "Gourmet Flavor Adventures", "Foodie Wonderland Unveiled", "Culinary Bliss Indulgence");
                break;
            case "homeAndGarden":
                titles.push("Elegant Home Accents", "Chic Decor Discoveries", "Stylish Living Essentials", "Garden Paradise Finds");
                break;
            case "jewelry":
                titles.push("Exquisite Jewelry Finds", "Timeless Accessories Gems", "Stunning Ornament Discoveries", "Jewelry Elegance Revealed");
                break;
            case "toysAndGames":
                titles.push("Fun Entertainment Picks", "Joyful Playtime Discoveries", "Kid-Friendly Adventures Unleashed", "Games Galore Excitement");
                break;
            default:
                titles.push("Nice review");
        }
        return titles;
    };

    const generateUniqueDescriptions = (category) => {
        const descriptions = [];
        switch (category) {
            case "apparel":
                descriptions.push("Great clothing quality and stylish designs!", "Super comfortable and fits perfectly!", "Excellent fabric and stitching, highly recommended!", "Fashionable and trendy, love the collection!");
                break;
            case "beautyAndCosmetics":
                descriptions.push("Amazing makeup products, my new favorites!", "Highly pigmented and long-lasting, worth every penny!", "Skin-friendly and cruelty-free, love the brand!", "Gorgeous shades and great texture, obsessed!");
                break;
            case "cycles":
                descriptions.push("Smooth ride and sturdy frame, exceeded my expectations!", "Perfect for both commuting and leisure rides!", "Easy to assemble and great value for money!", "Durable construction and excellent grip, love the bike!");
                break;
            case "electronics":
                descriptions.push("Impressive performance and sleek design, top-notch!", "User-friendly interface and fast processing speed, very satisfied!", "High-quality materials and advanced features, a tech lover's dream!", "Reliable and efficient, couldn't be happier!");
                break;
            case "foodAndDrink":
                descriptions.push("Delicious flavors and fresh ingredients, a gastronomic delight!", "Perfectly balanced taste and great packaging, my go-to snack!", "Healthy and nutritious options, guilt-free indulgence!", "Exquisite taste and impeccable quality, simply divine!");
                break;
            case "homeAndGarden":
                descriptions.push("Elegant home decor items, added charm to my space!", "Highly functional and aesthetically pleasing, love the design!", "Quality craftsmanship and durable materials, exceeded my expectations!", "Transformed my home into a cozy paradise, highly recommended!");
                break;
            case "jewelry":
                descriptions.push("Exquisite craftsmanship and timeless elegance, a true masterpiece!", "Beautifully designed and intricately detailed, love every piece!", "High-quality materials and stunning aesthetics, perfect for any occasion!", "Received countless compliments, definitely a conversation starter!");
                break;
            case "toysAndGames":
                descriptions.push("Fun and entertaining toys, kept the kids engaged for hours!", "Educational and interactive games, a great learning experience!", "Durable and safe for kids, parents' favorite choice!", "Endless fun and laughter, a must-have for family gatherings!");
                break;
            default:
                descriptions.push("Nice review");
        }
        return descriptions;
    };

    const titles = generateUniqueTitles(category);
    const descriptions = generateUniqueDescriptions(category);
    const client_id = getRandomNumber(10000, 99999);
    for (let i = 0; i < 4; i++) {
        const review = {
            id: getRandomNumber(1, 1000).toString(),
            client_id: client_id.toString(),
            created: getRandomDate().toISOString().slice(0, 19).replace('T', ' '),
            description: descriptions[i],
            email_verified: "0",
            flag_detail: null,
            flag_reason: "",
            ip_address: "18.130.142.225",
            order_id: "",
            product_id: "",
            product_sku: null,
            rating: "5",
            referrer_url: "",
            region: null,
            reply: null,
            request_id: "0",
            reviewer_display_name: null,
            reviewer_email: null,
            reviewer_image: null,
            reviewer_name: "reviewer " + getRandomNumber(1, 1000).toString(),
            reviewer_type: null,
            status: "published",
            title: titles[i]
        };
        latestReviews.push(review);
    }

    return latestReviews;
}


// Function to generate random interactions data with a curve
function generateRandomInteractionsData() {
    let interactionsData = [["Date", "Lightbox Views", "Product Clicks", "Email Clicks"]];
    let dateStrings = generateDateStrings();

    for (let i = 0; i < dateStrings.length; i++) {
        let date = dateStrings[i];
        let lightboxViewed = Math.floor(Math.random() * 71);
        let productClicks = Math.floor(Math.random() * 71);
        let emailClicks = Math.floor(Math.random() * 71);
        interactionsData.push([date, lightboxViewed, productClicks, emailClicks]);
    }

    return interactionsData;
}

// Helper function to generate random number within a range
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//function to generate orders for order list based on client category 
function generateOrdersListSample() {
    // Helper function to generate random date from the past 30 days
    function getRandomDate() {
        const now = new Date();
        const randomOffset = Math.floor(Math.random() * 30); // Random number between 0 and 29
        const randomDate = new Date(now.setDate(now.getDate() - randomOffset));
        return randomDate;
    }

    // Helper function to format date as "DD MMM YYYY"
    function formatDate(date) {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    }

    // Helper function to format time as "HH:mm:ss"
    function formatTime(date) {
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return date.toLocaleTimeString('en-GB', options);
    }

    // Helper function to generate order item name and product img URL based on category
    function generateOrderItem() {
        switch (category) {
            case "apparel":
                return {
                    name: "T-shirt",
                    product_img_url: "https://www.nobodyschild.com/media/catalog/product/b/2/b212715blu_fr.jpg"
                };
            case "beautyAndCosmetics":
                return {
                    name: "Perfume",
                    product_img_url: "https://app.oculizm.com/wp-content/uploads/2022/11/insta_profile_20051-316470659_528020046031578_7612998977224968577_n-1024x1024.jpg"
                };
            case "cycles":
                return {
                    name: "Mountain Bike",
                    product_img_url: "https://checkout.ribblecycles.co.uk/media/catalog/product/e/n/endurance-al-disc_antracite_105_side-on_1_1.png"
                };
            case "electronics":
                return {
                    name: "Samsung Galaxy S23",
                    product_img_url: "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Aimages.samsung.com%2Fis%2Fimage%2Fsamsung%2Fp6pim%2Fuk%2F2302%2Fgallery%2Fuk-galaxy-s23-s911-sm-s911bzkdeub-534791532%3F%241300_1300_jpg%24&feedId=35443&k=6c07de40c9fee3492a8324630c1c102ef2e9146f"
                };
            case "foodAndDrink":
                return {
                    name: "Beer",
                    product_img_url: "https://www.rattandirect.co.uk/media/catalog/product/2/_/2_85_1.jpg"
                };
            case "homeAndGarden":
                return {
                    name: "Garden Chair",
                    product_img_url: "https://www.rattandirect.co.uk/media/catalog/product/2/_/2_85_1.jpg"
                };
            case "jewelry":
                return {
                    name: "Necklace",
                    product_img_url: "https://allumer.co.uk/wp-content/uploads/2016/11/69-girl-girl-cover1.jpg"
                };
            case "toysAndGames":
                return {
                    name: "Toy ABC",
                    product_img_url: "https://cdn.shopify.com/s/files/1/0479/5039/7594/products/Alaabiworksheets-visuals-Winter-13.jpg?v=1676281249"
                };
            default:
                return {
                    name: "Product",
                    product_img_url: "https://cdn.shopify.com/s/files/1/0479/5039/7594/products/Alaabiworksheets-visuals-Winter-13.jpg?v=1676281249"
                };
        }
    }

    // Populate orders array

    for (let i = 0; i < 2; i++) { // Generate 2 random orders
        const clientName = client.name.replace(/ /g, '-');
        const clientId = client.id;
        const created = getRandomDate();
        const createdDate = formatDate(created);
        const createdTime = formatTime(created);

        const eventCreated = getRandomDate(); // Random event creation date (different from order creation date)

        const orderItem = generateOrderItem();

        orders.push({
            order_id: `55${getRandomNumber(100000000, 999999999)}`, // Random 10-digit number starting with 55
            created: `${created.getFullYear()}-${('0' + (created.getMonth() + 1)).slice(-2)}-${('0' + created.getDate()).slice(-2)} ${createdTime}`,
            session_id: `2C57s${getRandomNumber(100000, 999999)}`, // Random 6-digit number starting with 2C57s
            browsername: "",
            cookieEnabled: "true",
            createdDate: createdDate,
            createdTime: createdTime,
            currency: "GBP",
            event_types: [
                {
                    id: getRandomNumber(1000000, 9999999), // Random 7-digit number
                    type: "gridView",
                    created: `${eventCreated.getFullYear()}-${('0' + (eventCreated.getMonth() + 1)).slice(-2)}-${('0' + eventCreated.getDate()).slice(-2)} ${formatTime(eventCreated)}`,
                    createdDate: formatDate(eventCreated),
                    createdTime: formatTime(eventCreated),
                    client_id: clientId,
                    hostname: `${clientName}.com`,
                    post_id: "0",
                    session_id: `2C57s${getRandomNumber(100000, 999999)}`, // Random 6-digit number starting with 2C57s
                    sku: "null"
                },
                {
                    id: getRandomNumber(1000000, 9999999), // Random 7-digit number
                    type: "loadMore",
                    created: `${eventCreated.getFullYear()}-${('0' + (eventCreated.getMonth() + 1)).slice(-2)}-${('0' + eventCreated.getDate()).slice(-2)} ${formatTime(eventCreated)}`,
                    createdDate: formatDate(eventCreated),
                    createdTime: formatTime(eventCreated),
                    client_id: clientId,
                    hostname: `${clientName}.com`,
                    post_id: "0",
                    session_id: `2C57s${getRandomNumber(100000, 999999)}`, // Random 6-digit number starting with 2C57s
                    sku: "null"
                },
                {
                    id: getRandomNumber(1000000, 9999999), // Random 7-digit number
                    type: "expand",
                    created: `${eventCreated.getFullYear()}-${('0' + (eventCreated.getMonth() + 1)).slice(-2)}-${('0' + eventCreated.getDate()).slice(-2)} ${formatTime(eventCreated)}`,
                    createdDate: formatDate(eventCreated),
                    createdTime: formatTime(eventCreated),
                    client_id: clientId,
                    hostname: `${clientName}.com`,
                    post_id: "69823",
                    session_id: `2C57s${getRandomNumber(100000, 999999)}`, // Random 6-digit number starting with 2C57s
                    sku: "null"
                },
                {
                    id: getRandomNumber(1000000, 9999999), // Random 7-digit number
                    type: "shop",
                    created: `${eventCreated.getFullYear()}-${('0' + (eventCreated.getMonth() + 1)).slice(-2)}-${('0' + eventCreated.getDate()).slice(-2)} ${formatTime(eventCreated)}`,
                    createdDate: formatDate(eventCreated),
                    createdTime: formatTime(eventCreated),
                    client_id: clientId,
                    hostname: `${clientName}.com`,
                    post_id: "69823",
                    session_id: `2C57s${getRandomNumber(100000, 999999)}`, // Random 6-digit number starting with 2C57s
                    sku: orderItem.sku
                },
                {
                    id: getRandomNumber(1000000, 9999999), // Random 7-digit number
                    type: "order",
                    created: `${eventCreated.getFullYear()}-${('0' + (eventCreated.getMonth() + 1)).slice(-2)}-${('0' + eventCreated.getDate()).slice(-2)} ${formatTime(eventCreated)}`,
                    createdDate: formatDate(eventCreated),
                    createdTime: formatTime(eventCreated),
                    client_id: clientId,
                    hostname: `${clientName}.com`,
                    order_id: `55${getRandomNumber(100000000, 999999999)}`, // Random 10-digit number starting with 55
                    post_id: "0",
                    session_id: `2C57s${getRandomNumber(100000, 999999)}`, // Random 6-digit number starting with 2C57s
                    sku: "null"
                }
            ],
            multipleOrdersSessionid: false,
            orderWithInteractions: true,
            order_amount: getRandomNumber(50, 500), // Random order amount between 50 and 500 GBP
            order_items: [
                {
                    id: getRandomNumber(100000, 999999), // Random 6-digit number
                    order_id: `55${getRandomNumber(100000000, 999999999)}`, // Random 10-digit number starting with 55
                    sku: orderItem.sku,
                    name: orderItem.name,
                    price: getRandomNumber(10, 100), // Random price between 10 and 100 GBP
                    quantity: getRandomNumber(1, 5), // Random quantity between 1 and 5
                    product_id: null,
                    product_img_url: orderItem.product_img_url,
                }
            ],
            payment_method: null,
            platform: "Win32",
            total_order_amount: getRandomNumber(50, 500), // Random total order amount between 50 and 500 GBP
            user_journey: "",
            version: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        });
    }

}

// function to Generate top products based on category
function generateTopProducts() {
    const topProducts = [];

    // Generate top products based on category
    switch (category) {
        case "toysAndGames":
            for (let i = 0; i < 4; i++) {
                topProducts.push({
                    client_id: client.id,
                    count: Math.floor(Math.random() * 41) + 10,
                    product_id: `693501945465${i + 1}`,
                    product_sku: `436${i + 1}`,
                    image_link: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-product-${i + 1}.jpg`,
                    product_title: `Toy ${String.fromCharCode(65 + i)}`
                });
            }
            break;
        case "beautyAndCosmetics":
            for (let i = 0; i < 4; i++) {
                topProducts.push({
                    client_id: client.id,
                    count: Math.floor(Math.random() * 41) + 10,
                    product_id: `693501791455${i + 1}`,
                    product_sku: `392${i + 1}`,
                    image_link: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-product-${i + 1}.jpg`,
                    product_title: `Cosmetic ${String.fromCharCode(65 + i)}`
                });
            }
            break;
        case "cycles":
            for (let i = 0; i < 4; i++) {
                topProducts.push({
                    client_id: client.id,
                    count: Math.floor(Math.random() * 41) + 10,
                    product_id: `693501791455${i + 1}`,
                    product_sku: `435${i + 1}`,
                    image_link: "https://cdn.shopify.com/s/files/1/0585/2050/2462/products/PineSamplePack.jpg?v=1644521641",
                    product_title: `Bike ${String.fromCharCode(65 + i)}`
                });
            }
            break;
        case "electronics":
            for (let i = 0; i < 4; i++) {
                topProducts.push({
                    client_id: client.id,
                    count: Math.floor(Math.random() * 41) + 10,
                    product_id: `693501791455${i + 1}`,
                    product_sku: `435${i + 1}`,
                    image_link: "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Aimages.samsung.com%2Fis%2Fimage%2Fsamsung%2Fp6pim%2Fuk%2F2302%2Fgallery%2Fuk-galaxy-s23-s911-sm-s911bzkdeub-534791532%3F%241300_1300_jpg%24&feedId=35443&k=6c07de40c9fee3492a8324630c1c102ef2e9146f",
                    product_title: `Phone ${String.fromCharCode(65 + i)}`
                });
            }
            break;
        case "foodAndDrink":
            for (let i = 0; i < 4; i++) {
                topProducts.push({
                    client_id: client.id,
                    count: Math.floor(Math.random() * 41) + 10,
                    product_id: `693501981510${i + 1}`,
                    product_sku: `444${i + 1}`,
                    image_link: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-product-${i + 1}.jpg`,
                    product_title: `Garden Item ${String.fromCharCode(65 + i)}`
                });
            }
            break;
        case "homeAndGarden":
            for (let i = 0; i < 4; i++) {
                topProducts.push({
                    client_id: client.id,
                    count: Math.floor(Math.random() * 41) + 10,
                    product_id: `693501981510${i + 1}`,
                    product_sku: `444${i + 1}`,
                    image_link: `https://app.oculizm.com/wp-content/uploads/sample_data/home-and-garden-product-${i + 1}.webp`,
                    product_title: `Garden Item ${String.fromCharCode(65 + i)}`
                });
            }
            break;
        case "apparel":
            for (let i = 0; i < 4; i++) {
                topProducts.push({
                    client_id: client.id,
                    count: Math.floor(Math.random() * 41) + 10,
                    product_id: `693501791455${i + 1}`,
                    product_sku: `392${i + 1}`,
                    image_link: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-product-${i + 1}.jpg`,
                    product_title: `Apparel ${String.fromCharCode(65 + i)}`
                });
            }
            break;
        case "jewelry":
            for (let i = 0; i < 4; i++) {
                topProducts.push({
                    client_id: client.id,
                    count: Math.floor(Math.random() * 41) + 10,
                    product_id: `693501791455${i + 1}`,
                    product_sku: `392${i + 1}`,
                    image_link: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-product-${i + 1}.jpg`,
                    product_title: `Jewelry ${String.fromCharCode(65 + i)}`
                });
            }
            break;
        case "toysAndGames":
            for (let i = 0; i < 4; i++) {
                topProducts.push({
                    client_id: client.id,
                    count: Math.floor(Math.random() * 41) + 10,
                    product_id: `693501945465${i + 1}`,
                    product_sku: `436${i + 1}`,
                    image_link: "https://cdn.shopify.com/s/files/1/0479/5039/7594/products/Alaabiworksheets-visuals-Winter-13.jpg?v=1676281249",
                    product_title: `Toy ${String.fromCharCode(65 + i)}`
                });
            }
            break;
        default:
            // Add default product
            topProducts.push({
                product_id: "default_id",
                product_sku: "default_sku",
                image_link: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-product-${i + 1}.jpg`,
                product_title: "Default Product"
            });
            break;
    }

    return topProducts;
}

// function to Generate top posts based on category
function generateTopPosts() {
    const topPosts = [];

    // Generate top posts based on category
    switch (category) {
        case "toysAndGames":
            for (let i = 0; i < 4; i++) {
                topPosts.push({
                    post_id: Math.floor(Math.random() * 100000),
                    post_title: `Toy ${String.fromCharCode(65 + i)}`,
                    social_network: "instagram",
                    count: Math.floor(Math.random() * 200) + 100,
                    date: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000),
                    date_diff: `${Math.floor(Math.random() * 6)} months ago`,
                    image_url: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-post-${i + 1}.jpg`,
                    video_url: false
                });
            }
            break;
        case "cycles":
            for (let i = 0; i < 4; i++) {
                topPosts.push({
                    post_id: Math.floor(Math.random() * 100000),
                    post_title: `Bike ${String.fromCharCode(65 + i)}`,
                    social_network: "instagram",
                    count: Math.floor(Math.random() * 200) + 100,
                    date: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000),
                    date_diff: `${Math.floor(Math.random() * 6)} months ago`,
                    image_url: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-post-${i + 1}.jpg`,
                    video_url: false
                });
            }
            break;
        case "beautyAndCosmetics":
            for (let i = 0; i < 4; i++) {
                topPosts.push({
                    post_id: Math.floor(Math.random() * 100000),
                    post_title: `Cosmetic ${String.fromCharCode(65 + i)}`,
                    social_network: "instagram",
                    count: Math.floor(Math.random() * 200) + 100,
                    date: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000),
                    date_diff: `${Math.floor(Math.random() * 6)} months ago`,
                    image_url: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-post-${i + 1}.jpg`,
                    video_url: false
                });
            }
            break;
        case "homeAndGarden":
            for (let i = 0; i < 4; i++) {
                topPosts.push({
                    post_id: Math.floor(Math.random() * 100000),
                    post_title: `Garden Item ${String.fromCharCode(65 + i)}`,
                    social_network: "instagram",
                    count: Math.floor(Math.random() * 200) + 100,
                    date: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000),
                    date_diff: `${Math.floor(Math.random() * 6)} months ago`,
                    image_url: `https://app.oculizm.com/wp-content/uploads/sample_data/home-and-garden-post-${i + 1}.jpg`,
                    video_url: false
                });
            }
            break;
        case "apparel":
            for (let i = 0; i < 4; i++) {
                topPosts.push({
                    post_id: Math.floor(Math.random() * 100000),
                    post_title: `Apparel ${String.fromCharCode(65 + i)}`,
                    social_network: "instagram",
                    count: Math.floor(Math.random() * 200) + 100,
                    date: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000),
                    date_diff: `${Math.floor(Math.random() * 6)} months ago`,
                    image_url: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-post-${i + 1}.jpg`,
                    video_url: false
                });
            }
            break;
        case "jewelry":
            for (let i = 0; i < 4; i++) {
                topPosts.push({
                    post_id: Math.floor(Math.random() * 100000),
                    post_title: `Jewelry ${String.fromCharCode(65 + i)}`,
                    social_network: "instagram",
                    count: Math.floor(Math.random() * 200) + 100,
                    date: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000),
                    date_diff: `${Math.floor(Math.random() * 6)} months ago`,
                    image_url: `https://app.oculizm.com/wp-content/uploads/sample_data/apparel-post-${i + 1}.jpg`,
                    video_url: false
                });
            }
            break;
        default:
            // Generate default top posts
            for (let i = 0; i < 4; i++) {
                topPosts.push({
                    post_id: Math.floor(Math.random() * 100000),
                    post_title: `Default Post ${i + 1}`,
                    social_network: "instagram",
                    count: Math.floor(Math.random() * 200) + 100,
                    date: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000),
                    date_diff: `${Math.floor(Math.random() * 6)} months ago`,
                    image_url: "https://app.oculizm.com/wp-content/uploads/2023/08/insta_tags_99828-371022211_1756546181477305_3893447112052924175_n-819x1024.jpg",
                    video_url: false
                });
            }
            break;
    }

    return topPosts;
}

// function to Generate top content creators based on category
function generateTopContentCreators() {
    const profilePicSets = {
        apparel: [
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-1.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-2.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-3.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-4.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-5.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-6.jpg"
        ],
        beautyAndCosmetics: [
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-1.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-2.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-3.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-4.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-5.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-6.jpg"
        ],
        cycles: [
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-1.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-2.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-3.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-4.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-5.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-6.jpg"
        ],
        electronics: [
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-1.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-2.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-3.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-4.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-5.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-6.jpg"
        ],
        homeAndGarden: [
            "https://app.oculizm.com/wp-content/uploads/sample_data/home-and-garden-content-creator-1.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/home-and-garden-content-creator-2.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/home-and-garden-content-creator-3.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/home-and-garden-content-creator-4.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/home-and-garden-content-creator-5.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/home-and-garden-content-creator-6.jpg"
        ],
        jewelry: [
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-1.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-2.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-3.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-4.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-5.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-6.jpg"
        ],
        toysAndGames: [
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-1.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-2.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-3.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-4.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-5.jpg",
            "https://app.oculizm.com/wp-content/uploads/sample_data/apparel-content-creator-6.jpg"
        ]
    };

    const topContentCreators = [];

    // Generate top content creators
    for (let i = 0; i < 6; i++) {
        const username = `user_${Math.floor(Math.random() * 10000)}`;
        const screenName = `Screen Name ${String.fromCharCode(65 + i)}`;
        const profilePicUrl = profilePicSets[category][i];
        topContentCreators.push({
            id: Math.floor(Math.random() * 1000),
            username: username,
            screen_name: screenName,
            social_network: "instagram",
            count: Math.floor(Math.random() * 20) + 1,
            profile_pic_url: profilePicUrl,
            social_network_user_id: Math.floor(Math.random() * 100000)
        });
    }

    return topContentCreators;
}

// Function to generate top hashtags based on category
function generateTopHashtags() {
    const hashtagsByCategory = {
        toysAndGames: ['toys', 'games', 'boardgames', 'lego', 'actionfigures', 'puzzles', 'playtime', 'kids', 'fun', 'play', 'toystagram', 'toycollector', 'familygames', 'playdate', 'children', 'buildingblocks', 'educationaltoys', 'toyphotography', 'playroom', 'imaginativeplay'],
        cycles: ['cycling', 'biking', 'bicycle', 'mountainbike', 'cyclist', 'roadbike', 'cyclinglife', 'bikestagram', 'bikelife', 'cyclingphotos', 'bikeride', 'stravacycling', 'bikepacking', 'cyclelife', 'bicyclelife', 'cyclingadventures', 'bikes', 'cyclinglove', 'cycle', 'cyclingpics'],
        beautyAndCosmetics: ['makeup', 'beauty', 'skincare', 'cosmetics', 'makeupartist', 'beautytips', 'makeuplover', 'beautybloggers', 'beautyaddict', 'mua', 'instamakeup', 'beautygram', 'makeupaddict', 'makeupjunkie', 'makeuptutorial', 'beautycommunity', 'makeupoftheday', 'beautyproducts', 'makeuplooks', 'beautyblogger'],
        homeAndGarden: ['home', 'garden', 'homedecor', 'interiordesign', 'decor', 'homestyle', 'homedesign', 'interior', 'homeinspiration', 'homegoods', 'homedecoration', 'homedetails', 'gardening', 'plants', 'homedesignideas', 'houseplants', 'homeinteriors', 'homegoals', 'gardenlife', 'gardendesign'],
        apparel: ['fashion', 'style', 'clothing', 'outfit', 'ootd', 'fashionista', 'streetstyle', 'fashionstyle', 'dress', 'stylish', 'fashionable', 'fashionblogger', 'lookbook', 'fashiongram', 'instafashion', 'wardrobe', 'fashiondiaries', 'fashionblog', 'styleblogger', 'trendy'],
        jewelry: ['jewelry', 'accessories', 'necklace', 'bracelet', 'earrings', 'ring', 'jewelrydesign', 'jewelryaddict', 'jewelrylover', 'handmadejewelry', 'fashionjewelry', 'gold', 'silver', 'diamonds', 'gemstones', 'finejewelry', 'jewelrygram', 'jewelrydesigner', 'jewelryoftheday', 'jewelryshop']
    };

    const hashtags = hashtagsByCategory[category];
    const topHashtags = [];

    for (let i = 0; i < 20; i++) {
        const hashtag = hashtags[Math.floor(Math.random() * hashtags.length)];
        const count = Math.floor(Math.random() * 30) + 10; // Random count between 10 and 40
        topHashtags.push({ hashtag, count });
    }

    return topHashtags;
}

// Function to generate posts based on category
function generatePosts() {
    const allPosts = {
        toysAndGames: [
            { post_id: 70347, post_title: "Toy Car Racing", caption: "Get ready for an exciting toy car racing adventure!", author_name: "John Doe", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088345", image_url: "https://example.com/toysAndGames/post1.jpg" },
            { post_id: 70348, post_title: "Building Blocks Fun", caption: "Unleash your creativity with our new building blocks set!", author_name: "Emma Smith", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088346", image_url: "https://example.com/toysAndGames/post2.jpg" },
            { post_id: 70349, post_title: "Dollhouse Dreams", caption: "Create magical moments with our beautiful dollhouse collection!", author_name: "Sophia Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088347", image_url: "https://example.com/toysAndGames/post3.jpg" },
            { post_id: 70350, post_title: "LEGO City Adventure", caption: "Explore a world of fun with our LEGO City sets!", author_name: "Michael Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088348", image_url: "https://example.com/toysAndGames/post4.jpg" },
            { post_id: 70351, post_title: "Puzzle Mania", caption: "Challenge your mind with our collection of puzzles!", author_name: "David Brown", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088349", image_url: "https://example.com/toysAndGames/post5.jpg" },
            { post_id: 70352, post_title: "Remote Control Madness", caption: "Take control with our wide range of remote control toys!", author_name: "Sarah Thompson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088350", image_url: "https://example.com/toysAndGames/post6.jpg" },
            { post_id: 70353, post_title: "Board Game Bonanza", caption: "Gather your friends and family for a board game extravaganza!", author_name: "Daniel Garcia", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088351", image_url: "https://example.com/toysAndGames/post7.jpg" },
            { post_id: 70354, post_title: "Play-Doh Creativity", caption: "Unleash your imagination with our Play-Doh sets!", author_name: "Ella Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088352", image_url: "https://example.com/toysAndGames/post8.jpg" }
        ],
        cycles: [
            { post_id: 70355, post_title: "Mountain Biking Adventure", caption: "Explore the great outdoors with our mountain biking gear!", author_name: "Chris Brown", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088353", image_url: "https://example.com/cycles/post1.jpg" },
            { post_id: 70356, post_title: "City Commuter Bike", caption: "Navigate the urban jungle with our sleek city commuter bike!", author_name: "Emma Thompson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088354", image_url: "https://example.com/cycles/post2.jpg" },
            { post_id: 70357, post_title: "Off-Road Adventure", caption: "Conquer rough terrain with our off-road cycling gear!", author_name: "Liam Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088355", image_url: "https://example.com/cycles/post3.jpg" },
            { post_id: 70358, post_title: "Kids' Bike Fun", caption: "Introduce your child to the joy of cycling with our kids' bike range!", author_name: "Olivia Davis", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088356", image_url: "https://example.com/cycles/post4.jpg" },
            { post_id: 70359, post_title: "Electric Bike Revolution", caption: "Join the electric bike revolution and cruise with ease!", author_name: "Noah Martinez", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088357", image_url: "https://example.com/cycles/post5.jpg" },
            { post_id: 70360, post_title: "Vintage Bike Charm", caption: "Experience the charm of vintage biking with our classic collection!", author_name: "Ava Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088358", image_url: "https://example.com/cycles/post6.jpg" },
            { post_id: 70361, post_title: "BMX Thrills", caption: "Get ready for BMX thrills with our high-performance bikes!", author_name: "James Brown", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088359", image_url: "https://example.com/cycles/post7.jpg" },
            { post_id: 70362, post_title: "Custom Bike Creations", caption: "Create your dream ride with our custom bike creations!", author_name: "Sophia Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088360", image_url: "https://example.com/cycles/post8.jpg" }
        ],
        beautyAndCosmetics: [
            { post_id: 70365, post_title: "Glamorous Makeup Look", caption: "Achieve the perfect glamorous makeup look for any occasion!", author_name: "Emily White", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088362", image_url: "https://example.com/beautyAndCosmetics/post1.jpg" },
            { post_id: 70366, post_title: "Skincare Essentials", caption: "Discover the essential skincare products for healthy, glowing skin!", author_name: "Sophie Brown", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088363", image_url: "https://example.com/beautyAndCosmetics/post2.jpg" },
            { post_id: 70367, post_title: "Hair Care Tips", caption: "Get silky smooth hair with our top hair care tips and products!", author_name: "Emma Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088364", image_url: "https://example.com/beautyAndCosmetics/post3.jpg" },
            { post_id: 70368, post_title: "Makeup Tutorial: Smoky Eyes", caption: "Learn how to create mesmerizing smoky eyes with our makeup tutorial!", author_name: "Olivia Davis", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088365", image_url: "https://example.com/beautyAndCosmetics/post4.jpg" },
            { post_id: 70369, post_title: "Natural Beauty Products", caption: "Embrace natural beauty with our range of organic skincare and makeup products!", author_name: "Ava Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088366", image_url: "https://example.com/beautyAndCosmetics/post5.jpg" },
            { post_id: 70370, post_title: "Summer Makeup Vibes", caption: "Get summer-ready with our vibrant and colorful makeup collection!", author_name: "Noah Martinez", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088367", image_url: "https://example.com/beautyAndCosmetics/post6.jpg" },
            { post_id: 70371, post_title: "Scented Candles Galore", caption: "Fill your space with delightful fragrances with our scented candle range!", author_name: "Liam Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088368", image_url: "https://example.com/beautyAndCosmetics/post7.jpg" },
            { post_id: 70372, post_title: "Nail Art Masterclass", caption: "Master the art of nail design with our expert nail art masterclass!", author_name: "Sophia Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088369", image_url: "https://example.com/beautyAndCosmetics/post8.jpg" }
        ],
        homeAndGarden: [
            { post_id: 70380, post_title: "Rooftop Garden Paradise", caption: "Create your own rooftop garden paradise with our gardening tips!", author_name: "Emily White", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088376", image_url: "https://example.com/homeAndGarden/post1.jpg" },
            { post_id: 70381, post_title: "Cozy Outdoor Patio", caption: "Transform your outdoor space into a cozy patio retreat!", author_name: "Sophie Brown", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088377", image_url: "https://example.com/homeAndGarden/post2.jpg" },
            { post_id: 70382, post_title: "Garden Party Essentials", caption: "Host the perfect garden party with our essentials checklist!", author_name: "Emma Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088378", image_url: "https://example.com/homeAndGarden/post3.jpg" },
            { post_id: 70383, post_title: "DIY Plant Propagation", caption: "Learn how to propagate your favorite plants with our DIY guide!", author_name: "Olivia Davis", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088379", image_url: "https://example.com/homeAndGarden/post4.jpg" },
            { post_id: 70384, post_title: "Backyard BBQ Fun", caption: "Fire up the grill and enjoy some backyard BBQ fun with our tips and recipes!", author_name: "Ava Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088380", image_url: "https://example.com/homeAndGarden/post5.jpg" },
            { post_id: 70385, post_title: "Indoor Herb Garden", caption: "Grow your own fresh herbs indoors with our simple herb garden setup!", author_name: "Noah Martinez", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088381", image_url: "https://example.com/homeAndGarden/post6.jpg" },
            { post_id: 70386, post_title: "Chic Garden Furniture", caption: "Upgrade your outdoor space with our chic and stylish garden furniture!", author_name: "Liam Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088382", image_url: "https://example.com/homeAndGarden/post7.jpg" },
            { post_id: 70387, post_title: "Sustainable Gardening Tips", caption: "Go green with our sustainable gardening tips and practices!", author_name: "Sophia Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088383", image_url: "https://example.com/homeAndGarden/post8.jpg" }
        ],
        apparel: [
            { post_id: 70388, post_title: "Casual Weekend Look", caption: "Stay stylish and comfortable with our casual weekend outfit ideas!", author_name: "Emily White", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088384", image_url: "https://app.oculizm.com/wp-content/uploads/2023/11/insta_tags_43862-399863295_727164222778718_2348160559260985459_n-821x1024.jpg" },
            { post_id: 70389, post_title: "Formal Office Attire", caption: "Dress to impress at the office with our formal attire suggestions!", author_name: "Sophie Brown", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088385", image_url: "https://app.oculizm.com/wp-content/uploads/2023/11/insta_tags_43862-399863295_727164222778718_2348160559260985459_n-821x1024.jpg" },
            { post_id: 70390, post_title: "Athleisure Fashion Trends", caption: "Combine style and comfort with our athleisure fashion trends!", author_name: "Emma Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088386", image_url: "https://app.oculizm.com/wp-content/uploads/2023/11/insta_tags_43862-399863295_727164222778718_2348160559260985459_n-821x1024.jpg" },
            { post_id: 70391, post_title: "Summer Beachwear Essentials", caption: "Hit the beach in style with our summer beachwear essentials!", author_name: "Olivia Davis", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088387", image_url: "https://app.oculizm.com/wp-content/uploads/2023/11/insta_tags_43862-399863295_727164222778718_2348160559260985459_n-821x1024.jpg" },
            { post_id: 70392, post_title: "Cozy Winter Outfits", caption: "Stay warm and fashionable with our cozy winter outfit ideas!", author_name: "Ava Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088388", image_url: "https://app.oculizm.com/wp-content/uploads/2023/11/insta_tags_43862-399863295_727164222778718_2348160559260985459_n-821x1024.jpg" },
            { post_id: 70393, post_title: "Trendy Streetwear Looks", caption: "Rock the streets with our trendy and urban streetwear looks!", author_name: "Noah Martinez", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088389", image_url: "https://app.oculizm.com/wp-content/uploads/2023/11/insta_tags_43862-399863295_727164222778718_2348160559260985459_n-821x1024.jpg" },
            { post_id: 70394, post_title: "Elegant Evening Dresses", caption: "Dazzle at special occasions with our elegant evening dresses!", author_name: "Liam Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088390", image_url: "https://app.oculizm.com/wp-content/uploads/2023/11/insta_tags_43862-399863295_727164222778718_2348160559260985459_n-821x1024.jpg" },
            { post_id: 70395, post_title: "Vintage Fashion Revival", caption: "Revive vintage fashion with our curated collection of retro outfits!", author_name: "Sophia Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088391", image_url: "https://app.oculizm.com/wp-content/uploads/2023/11/insta_tags_43862-399863295_727164222778718_2348160559260985459_n-821x1024.jpg" }
        ],
        jewelry: [
            { post_id: 70396, post_title: "Statement Necklace Collection", caption: "Make a statement with our stunning necklace collection!", author_name: "Emily White", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088392", image_url: "https://example.com/jewelry/post1.jpg" },
            { post_id: 70397, post_title: "Elegant Diamond Earrings", caption: "Add a touch of elegance with our diamond earrings selection!", author_name: "Sophie Brown", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088393", image_url: "https://example.com/jewelry/post2.jpg" },
            { post_id: 70398, post_title: "Bohemian Bracelet Collection", caption: "Embrace your bohemian spirit with our unique bracelet collection!", author_name: "Emma Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088394", image_url: "https://example.com/jewelry/post3.jpg" },
            { post_id: 70399, post_title: "Classic Watch Designs", caption: "Stay timeless with our collection of classic watch designs!", author_name: "Olivia Davis", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088395", image_url: "https://example.com/jewelry/post4.jpg" },
            { post_id: 70400, post_title: "Chic Ring Styles", caption: "Discover chic and stylish ring designs to complement any outfit!", author_name: "Ava Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088396", image_url: "https://example.com/jewelry/post5.jpg" },
            { post_id: 70401, post_title: "Personalized Jewelry Collection", caption: "Add a personal touch with our customizable jewelry collection!", author_name: "Noah Martinez", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088397", image_url: "https://example.com/jewelry/post6.jpg" },
            { post_id: 70402, post_title: "Luxurious Pearl Accessories", caption: "Indulge in luxury with our exquisite pearl accessories!", author_name: "Liam Johnson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088398", image_url: "https://example.com/jewelry/post7.jpg" },
            { post_id: 70403, post_title: "Trendy Hoop Earrings", caption: "Stay trendy with our collection of chic hoop earrings!", author_name: "Sophia Wilson", date: 1707697838, date_diff: "2 days", post_status: "publish", social_network: "instagram", pinned_post: false, social_id: "18281522836088399", image_url: "https://example.com/jewelry/post8.jpg" }
        ]
    };

    return allPosts[category];
}


// Function to generate products based on category
function generateAllProducts() {
    const allProducts = [];

    // Generate top products based on category
    switch (category) {
        case "apparel":
            for (let i = 0; i < 8; i++) {
                allProducts.push({
                    id: getRandomNumber(10000000, 99999999).toString(),
                    sku: "APP-" + getRandomNumber(10000, 99999),
                    title: `Apparel ${String.fromCharCode(65 + i)}`,
                    image_link: "https://app.oculizm.com/wp-content/uploads/2023/11/insta_tags_43862-399863295_727164222778718_2348160559260985459_n-821x1024.jpg",
                    availability: "1",
                    client_id: client.id.toString(),
                    price: getRandomNumber(10, 500).toString()
                });
            }
            break;
        case "beautyAndCosmetics":
            for (let i = 0; i < 8; i++) {
                allProducts.push({
                    id: getRandomNumber(10000000, 99999999).toString(),
                    sku: "BAC-" + getRandomNumber(10000, 99999),
                    title: `Cosmetic ${String.fromCharCode(65 + i)}`,
                    image_link: "https://app.oculizm.com/wp-content/uploads/2022/11/twitter_20051-FhtDDY1X0AADM7s-1024x1024.jpg",
                    availability: "1",
                    client_id: client.id.toString(),
                    price: getRandomNumber(10, 500).toString()
                });
            }
            break;

        case "toysAndGames":
            for (let i = 0; i < 8; i++) {
                allProducts.push({
                    id: getRandomNumber(10000000, 99999999).toString(),
                    sku: "TAG-" + getRandomNumber(10000, 99999),
                    title: `Toys ${String.fromCharCode(65 + i)}`,
                    image_link: "https://app.oculizm.com/wp-content/uploads/2022/11/twitter_20051-FhtDDY1X0AADM7s-1024x1024.jpg",
                    availability: "1",
                    client_id: client.id.toString(),
                    price: getRandomNumber(10, 500).toString()
                });
            }
            break;

        case "cycles":
            for (let i = 0; i < 8; i++) {
                allProducts.push({
                    id: getRandomNumber(10000000, 99999999).toString(),
                    sku: "CYCLES-" + getRandomNumber(10000, 99999),
                    title: `Cycle ${String.fromCharCode(65 + i)}`,
                    image_link: "https://app.oculizm.com/wp-content/uploads/2022/11/twitter_20051-FhtDDY1X0AADM7s-1024x1024.jpg",
                    availability: "1",
                    client_id: client.id.toString(),
                    price: getRandomNumber(10, 500).toString()
                });
            }
            break;
        case "electronics":
            for (let i = 0; i < 8; i++) {
                allProducts.push({
                    id: getRandomNumber(10000000, 99999999).toString(),
                    sku: "HAG-" + getRandomNumber(10000, 99999),
                    title: `Home ${String.fromCharCode(65 + i)}`,
                    image_link: "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Aimages.samsung.com%2Fis%2Fimage%2Fsamsung%2Fp6pim%2Fuk%2F2302%2Fgallery%2Fuk-galaxy-s23-s911-sm-s911bzkdeub-534791532%3F%241300_1300_jpg%24&feedId=35443&k=6c07de40c9fee3492a8324630c1c102ef2e9146f",
                    availability: "1",
                    client_id: client.id.toString(),
                    price: getRandomNumber(10, 500).toString()
                });
            }
            break;
        case "homeAndGarden":
            for (let i = 0; i < 8; i++) {
                allProducts.push({
                    id: getRandomNumber(10000000, 99999999).toString(),
                    sku: "HAG-" + getRandomNumber(10000, 99999),
                    title: `Home ${String.fromCharCode(65 + i)}`,
                    image_link: "https://app.oculizm.com/wp-content/uploads/2022/11/twitter_20051-FhtDDY1X0AADM7s-1024x1024.jpg",
                    availability: "1",
                    client_id: client.id.toString(),
                    price: getRandomNumber(10, 500).toString()
                });
            }
            break;
        case "jewelry":
            for (let i = 0; i < 8; i++) {
                allProducts.push({
                    id: getRandomNumber(10000000, 99999999).toString(),
                    sku: "JLR-" + getRandomNumber(10000, 99999),
                    title: `Jewelry ${String.fromCharCode(65 + i)}`,
                    image_link: "https://app.oculizm.com/wp-content/uploads/2022/11/twitter_20051-FhtDDY1X0AADM7s-1024x1024.jpg",
                    availability: "1",
                    client_id: client.id.toString(),
                    price: getRandomNumber(10, 500).toString()
                });
            }
            break;
        default:
            // Generate default top products
            for (let i = 0; i < 8; i++) {
                allProducts.push({
                    id: getRandomNumber(10000000, 99999999).toString(),
                    sku: "DEFAULT-" + getRandomNumber(10000, 99999),
                    title: `Default Product ${i + 1}`,
                    image_link: "https://app.oculizm.com/wp-content/uploads/2023/08/insta_tags_99828-371022211_1756546181477305_3893447112052924175_n-819x1024.jpg",
                    availability: "1",
                    client_id: client.id.toString(),
                    price: getRandomNumber(10, 500).toString()
                });
            }
            break;
    }

    return allProducts;
}

// Function to generate Reviews based on category
function generateReviews() {
    const reviews = [];
    const reviewerNames = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Helen", "Ivy", "Jack"];
    const numReviewerNames = reviewerNames.length;

    for (let i = 0; i < 4; i++) {
        const randomDays = Math.floor(Math.random() * 20);
        const createdDate = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
        const description = generateRandomDescription();
        const clientId = client.id;
        const rating = Math.floor(Math.random() * 2) + 4;
        const status = Math.random() < 0.5 ? "published" : "new";
        const reviewerName = reviewerNames[Math.floor(Math.random() * numReviewerNames)];


        const review = {
            id: Math.floor(Math.random() * 100) + 1,
            client_id: clientId,
            created: createdDate,
            description: description,
            email_verified: "0",
            flag_detail: null,
            flag_reason: "",
            ip_address: "18.130.142.225",
            order_id: "",
            product_id: "",
            product_sku: null,
            rating: rating.toString(),
            referrer_url: "",
            region: null,
            reply: null,
            request_id: "0",
            reviewer_display_name: null,
            reviewer_email: null,
            reviewer_image: null,
            reviewer_name: reviewerName,
            reviewer_type: null,
            status: status,
            title: "Review Title"
        };
        reviews.push(review);
    }

    return reviews;
}

//Function to generate reviews summary
function generateReviewsSummary() {

    // Generate random overall rating (between 4.0 and 5.0 with one decimal)
    const overallRating = (Math.floor(Math.random() * 11) + 40) / 10;

    // Generate random total number of reviews (between 10 and 20)
    const totalReviews = Math.floor(Math.random() * 11) + 10;

    // Generate random site rating (between 4.0 and 5.0 with one decimal)
    const siteRating = (Math.floor(Math.random() * 11) + 40) / 10;

    // Generate random product rating (between 4.0 and 5.0 with one decimal)
    const productRating = (Math.floor(Math.random() * 11) + 40) / 10;

    // Generate chart data
    const chartData = {
        labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
        data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 11) + 1),
    };

    return { overallRating, totalReviews, siteRating, productRating, chartData };
}

// Function to generate Reviews description based on category
function generateRandomDescription() {
    const descriptions = {
        toysAndGames: ["Great toy!", "Fun for kids!", "Excellent quality!", "My kids love it!", "Highly recommended!"],
        cycles: ["Smooth ride!", "Sturdy construction!", "Easy to assemble!", "Perfect for commuting!", "Great value!"],
        beautyAndCosmetics: ["Amazing products!", "Works wonders!", "Improved my skin!", "Highly effective!", "Love the results!"],
        homeAndGarden: ["Beautiful addition to my garden!", "Easy to maintain!", "Transformed my outdoor space!", "Great for hosting parties!", "Highly durable!"],
        apparel: ["Comfortable fit!", "Stylish design!", "Versatile clothing!", "Perfect for any occasion!", "Great quality!"],
        jewelry: ["Beautiful craftsmanship!", "Matches everything!", "Received many compliments!", "Durable and elegant!", "Excellent value!"]
    };
    const randomIndex = Math.floor(Math.random() * descriptions[category].length);
    return descriptions[category][randomIndex];
}


// Function to check if sampleDataButton already exists in the given h2Element
function checkAndAppend(h2Element) {
    if (!h2Element.find('.label-sample-data').length) {
        // Append the new button element to the h2 element
        h2Element.append(sampleDataButton);
    }
}



(function ($) {

    jQuery(document).ready(function () {

        var uaParser = new UAParser();

        // populate order details lightbox 
        function populateOrderDetailsSampleLightbox(order) {

            // get this order's currency
            var currencyCode = order['currency'];

            // get the currency symbol from the currency code
            var extractRegionData = function (item) {
                return item[4] === currencyCode;
            }
            var r = regions_array.filter(extractRegionData)[0];
            var currencySymbol = r[3];

            // get this order's order items
            var orderItems = order['order_items'];

            // initialise the basket HTML
            var basketHtml = "";

            // initialise the order total
            var orderTotal = 0;

            // set the overlay title
            $('.content-block[name=order-items] h2').text('Order ' + order['order_id']);

            // for each order item...
            for (var i = 0; i < orderItems.length; i++) {

                // get the basket item price, handling the demo mode option
                var productPrice;
                productPrice = commaInt(parseFloat(orderItems[i]['price']).toFixed(2));

                // get other basket item data
                var productImg = orderItems[i]['product_img_url'];
                if (!productImg) productImg = site_url + "/wp-content/themes/oculizm/img/no-image.png";
                var productName = orderItems[i]['name'];
                var productSku = orderItems[i]['sku'];
                var numOrderItems = orderItems[i]['quantity'];

                // build the basket item HTML
                basketHtml += "<tr data-product-sku='" + productSku + "'>" +
                    // "	<td><a href='" + site_url + "/all-products/?product_id=" + productSku + "'><img src='" + productImg + "'></a></td>" +
                    "	<td><img src='" + productImg + "'></td>" +
                    "	<td name='product-title'>" + productName + "  (" + numOrderItems + ")</td>" +
                    "	<td>" + currencySymbol + productPrice + "</td>" +
                    "</tr>";

                // augment the total
                var productPriceNoComma = productPrice.replace(',', '');
                orderTotal += parseFloat(productPriceNoComma * numOrderItems);
            }

            // add a final row for the order total
            basketHtml += "<tr>" +
                "	<td class='pad-20'></td>" +
                "	<td class='pad-20'><b>Basket Total</b></td>" +
                "	<td class='pad-20'><b>" + currencySymbol + commaInt(orderTotal.toFixed(2)) + "</b></td>" +
                "</tr>";
            $('table[name=order-items] tbody').html($(basketHtml));

            // build the session info HTML
            var ua = order['version'];
            uaParser.setUA(ua);
            var uaResult = uaParser.getResult();
            var osName = uaResult.os.name;
            var browserName = uaResult.browser.name ?? order['browsername'];
            var paymentMethod = order['payment_method'];

            var uaHtml = "<div class='user-agent'>";
            if (osName) uaHtml += "<span name='" + osName + "'></span>" + osName + "&nbsp;&nbsp;&nbsp;&nbsp;";
            if (browserName) uaHtml += "<span name='" + browserName + "'></span>" + browserName + "&nbsp;&nbsp;&nbsp;&nbsp;";
            if (paymentMethod) uaHtml += "<span name='" + paymentMethod + "'></span>" + paymentMethod + "&nbsp;&nbsp;&nbsp;&nbsp;";

            uaHtml += "</div>";
            // uaHtml += "<div class='pad-10-0'>Session ID: " + $(this).attr('data-session-id') + "</div>";
            $('.content-block[name=session-information] .content-block-body .placeholder').html(uaHtml);

            // build the user journey HTML
            var ujHtml = order['user_journey'];
            $('table[name=user-journey] tbody').html($(ujHtml));

            $('.form-overlay[name=order-details] .next-button').hide();
            $('.form-overlay[name=order-details] .prev-button').hide();
        }

        // open the order details overlay
        $('body').on('click', 'table[name=orders] tr.sample-data', function () {

            // open the overlay
            $('.form-overlay[name=order-details]').fadeIn();

            // get this order
            orderId = $(this).attr('data-order-id');
            order = searchArrayForOrderID(orderId, orders);

            populateOrderDetailsSampleLightbox(order);
        });

        jQuery._noDataPlaceholderGenerator = function (targetClass, type, title, text, icon, ctaText, ctaLink) {
            let html;
            switch (type) {
                case "RichContentBlock":
                    html = `<div class="no-data-placeholder"><div class="content-block-inner"><p>${title}</p></div></div>`;
                    break;
                case "DivWithTextAndLargeIconAndCTA":
                    html = `<div class="no-data-placeholder"><p>${title}<a href="${site_url}/${ctaLink}/">${ctaText}</a> ${text}</p><img src="${site_url}/wp-content/themes/oculizm/img/${icon}"></div>`;
                    break;
                case "Text":
                    html = `<div class="no-data-placeholder"><p>${title}</p></div>`;
                    break;
                case "DivWithTextAndLargeIcon":
                    html = `<div class="no-data-placeholder"><p>${title}</p><img src="${site_url}/wp-content/themes/oculizm/img/${icon}"></div>`;
                    break;
                default:
                    html = `<div class="no-data-placeholder"><p>${title}</p></div>`;
            }
            $(targetClass).append(html);
        };


        jQuery._sampleData = function (targetClass, targetElement) {
            let html = "";
            // get client
            $.ajax({
                url: ajaxUrl,
                data: {
                    'action': 'get_client'
                },
                dataType: 'JSON',

                success: function (data) {
                    client = data;
                    category = client.category;
                    switch (targetElement) {
                        case "interactions":
                            // Generate random interactions data
                            let interactions = generateRandomInteractionsData();

                            // Draw interactions chart
                            google.charts.load('current', { 'packages': ['corechart', 'bar'] });
                            google.charts.setOnLoadCallback(function () {
                                drawInteractionsChart(interactions);
                            });

                            // Find the h2 element with the class "h2-icon"
                            h2Element = $('.content-block[name="interactions"] h2.h2-icon');

                            // Check and append the new sample data button element to the h2 element
                            checkAndAppend(h2Element);

                            break;

                        case "views":

                            // Generate random views data
                            let views = generateRandomViewsData();

                            // Draw views chart
                            google.charts.load('current', { 'packages': ['corechart', 'bar'] });
                            google.charts.setOnLoadCallback(function () {
                                drawViewsChart(views);
                            });

                            // Find the h2 element with the class "h2-icon"
                            h2Element = $('.content-block[name="views"] h2.h2-icon');

                            // Check and append the new sample data button element to the h2 element
                            checkAndAppend(h2Element);
                            break;

                        case "orders-list":
                            generateOrdersListSample();
                            console.log("orders : ", orders);

                            for (var i = 0; i < orders.length; i++) {
                                var date = orders[i]['createdDate'];
                                var time = orders[i]['createdTime'];
                                // getting the clicked order id
                                var orderWithInteractionsIcon = '';
                                var multipleOrdersIcon = '';
                                var eventsHtml = "";


                                if (orders[i]['event_types'] && typeof orders[i]['event_types'] === 'object') {
                                    Object.keys(orders[i]['event_types']).forEach(function (key) {
                                        var eventType = orders[i]['event_types'][key]['type'];
                                        var post_id;
                                        var eventIcon = "";
                                        var eventLink = "";
                                        var product_id;
                                        var objectOrderId = orders[i]['order_id'];
                                        var afterOrderClickedEvent = false;


                                        // getting the multiordersessionid value
                                        var multipleOrdersSessionid = orders[i]['multipleOrdersSessionid'];
                                        if (multipleOrdersSessionid) multipleOrdersIcon = '<div class="mini-icon" name="multiple-orders" title="Multiple orders were placed in this session"></div>';

                                        // getting the orderWithInteractions value
                                        var orderWithInteractions = orders[i]['orderWithInteractions'];
                                        if (orderWithInteractions) orderWithInteractionsIcon = '<div title="This order featured deeper interaction" name="deep-interaction" class="mini-icon"></div>';



                                        // determine row content
                                        if (eventType == "gridView") eventIcon = "<div class='mini-icon' name='gallery-viewed'></div>";
                                        if (eventType == "loadMore") eventIcon = "<div class='mini-icon' name='load-more'></div>";
                                        if (eventType == "shop") product_id = orders[i]['event_types'][key]['sku'];
                                        if (eventType == "order") eventIcon = "<div class='mini-icon' name='order'></div>";
                                        if (
                                            (eventType == "ppgNav") ||
                                            (eventType == "hwNav") ||
                                            (eventType == "ppgLightboxNav") ||
                                            (eventType == "sgLightboxNav") ||
                                            (eventType == "hwLightboxNav")
                                        )
                                            eventIcon = "<div class='mini-icon' name='widget-scrolled'></div>";
                                        if (
                                            (eventType == "ppgLightboxOpen") ||
                                            (eventType == "expand") ||
                                            (eventType == "hwLightboxOpen") ||
                                            (eventType == "shop")
                                        ) {
                                            post_id = orders[i]['event_types'][key]['post_id'];
                                            var eventLink = "<a href='#'><img src='https://app.oculizm.com/wp-content/uploads/2023/12/insta_tags_71950-393113860_169494116253065_6125395506444962888_n-819x1024.jpg'></a>";

                                        }



                                        // determine row style
                                        var rowClass = "";
                                        var currentOrderID = orders[i]['event_types'][key]['order_id'];
                                        if (objectOrderId == currentOrderID) {
                                            rowClass = "main-event";
                                            afterOrderClickedEvent = true;
                                        }
                                        if (afterOrderClickedEvent && objectOrderId != currentOrderID) rowClass = "opacity-50";

                                        // use human readable event names
                                        if (eventType == 'gridView') eventType = 'Gallery Viewed';
                                        if (eventType == 'expand') eventType = 'Lightbox Viewed';
                                        if (eventType == 'shop') eventType = 'Product Link Clicked';
                                        if (eventType == 'order') eventType = 'Order Placed ' + currentOrderID;
                                        if (eventType == 'ppgLightboxOpen') eventType = 'Lightbox Viewed (PDP)';
                                        if (eventType == 'hwLightboxOpen') eventType = 'Lightbox Viewed (Homepage)';
                                        if (eventType == 'ppgNav') eventType = 'Widget Scrolled (PDP)';
                                        if (eventType == 'loadMore') eventType = 'Gallery Loaded More';
                                        if (eventType == 'hwNav') eventType = 'Widget Scrolled (Homepage)';
                                        if (eventType == 'ppgLightboxNav') eventType = 'Lightbox Scrolled (PDP)';
                                        if (eventType == 'sgLightboxNav') eventType = 'Lightbox Scrolled';
                                        if (eventType == 'hwLightboxNav') eventType = 'Lightbox Scrolled (Homepage)';




                                        // create the HTML for this event row
                                        var timeStr =
                                            orders[i]['event_types'][key]['createdDate'] +
                                            ' ' +
                                            orders[i]['event_types'][key]['createdTime'];
                                        eventsHtml +=
                                            "<tr class='" +
                                            rowClass +
                                            "' data-event-type='" +
                                            eventType +
                                            "' data-post-id='" +
                                            post_id +
                                            "' data-product-id='" +
                                            product_id +
                                            "'>" +
                                            "	<td>" +
                                            timeStr +
                                            "</td>" +
                                            "	<td name='event-details'>" +
                                            eventIcon +
                                            eventLink +
                                            "</td>" +
                                            "	<td>" +
                                            eventType +
                                            '</td>' +
                                            '</tr>';
                                    });
                                }
                                orders[i]['user_journey'] = eventsHtml;

                                html +=
                                    "<tr class='sample-data'" +
                                    " data-order-id='" +
                                    orders[i]['order_id'] +
                                    "'" +
                                    " data-num-items='" +
                                    orders[i]['order_items'].length +
                                    "'>" +
                                    "	<td>" +
                                    date +
                                    ' ' +
                                    time +
                                    '</td>' +
                                    "	<td>" +
                                    orders[i]['order_id'] +
                                    '</td>' +
                                    "	<td>" +
                                    orders[i]['order_items'].length +
                                    '</td>' +
                                    "	<td>£" +
                                    orders[i]['total_order_amount'] +
                                    '</td>' +
                                    "	<td>" +
                                    multipleOrdersIcon +
                                    orderWithInteractionsIcon +
                                    '</td>' +
                                    '</tr>';

                            }

                            // Find the h2 element with the class "h2-icon"
                            h2Element = $('.content-block[name="orders-list"] h2.h2-icon');

                            // Check and append the new sample data button element to the h2 element
                            checkAndAppend(h2Element);
                            break;

                        case "orders":
                            // Generate random orders data
                            let ordersByCurrency = generateRandomOrdersData();
                            // Draw orders chart
                            initOrderCharts(ordersByCurrency);

                            // Find the h2 element with the class "h2-icon"
                            h2Element = $('.content-block[name="orders"] h2.h2-icon');

                            // Check and append the new sample data button element to the h2 element
                            checkAndAppend(h2Element);
                            break;

                        case "revenue":
                            // Generate random revenue data
                            let revenueByCurrency = generateRandomRevenueData();

                            // Draw orders chart
                            initRevenueCharts(revenueByCurrency);

                            // Find the h2 element with the class "h2-icon"
                            h2Element = $('.content-block[name="revenue"] h2.h2-icon');

                            // Check and append the new sample data button element to the h2 element
                            checkAndAppend(h2Element);
                            break;

                        case "top-products":
                            const topProducts = generateTopProducts();

                            // Sort the topProducts array by count in descending order
                            topProducts.sort((a, b) => b.count - a.count);

                            for (var i = 0; (i <= 3) && (i < topProducts.length); i++) { //display max top 4 products

                                var ordersLabel = "Order";
                                if (topProducts[i]['count'] > 1) ordersLabel = "Orders";


                                html += "<div class='top-item'>" +
                                    "   <a class='product-inner' href='#'>" +
                                    "       <img class='image-fill' style='max-height: 283px;min-height: 283px;width: 100%;object-fit: fill;' src='" + topProducts[i]['image_link'] + "'>" +
                                    '       <div class="thumbnail-overlay">' +
                                    '           <span class="thumbnail-title">' + topProducts[i]['count'] + '</span>' +
                                    '           <span class="thumbnail-subtitle">' + ordersLabel + '</span>' +
                                    '       </div>' +
                                    "       <span class='product-inner-footer'>" + topProducts[i]['product_title'] + "</span>" +
                                    "   </a>" +
                                    "</div>";
                            }
                            // Find the h2 element with the class "h2-icon"
                            h2Element = $('.content-block[name="top-products"] h2.h2-icon');

                            // Check and append the new sample data button element to the h2 element
                            checkAndAppend(h2Element);
                            break;

                        case "top-posts":
                            const topPosts = generateTopPosts();

                            // Sort the topProducts array by count in descending order
                            topPosts.sort((a, b) => b.count - a.count);

                            for (var i = 0; (i <= 3) && (i < topPosts.length); i++) { //display max top 4 posts

                                var mediaHtml = "<img class='image-fill' style='max-height: 283px;width: 100%;' src='" + topPosts[i]['image_url'] + "'>";

                                html += "<div class='top-item' data-social-network='" + topPosts[i]['social_network'] + "'>" +
                                    "	<a class='post-inner' href='#'>" +
                                    mediaHtml +
                                    '<div class="post-attributes-overlay">' +
                                    '<div class="social-network-icon"></div>' +
                                    '</div>' +
                                    '<div class="thumbnail-overlay">' +
                                    '			<span class="thumbnail-title">' + topPosts[i]['count'] + '</span>' +
                                    '			<span class="thumbnail-subtitle">Interactions</span>' +
                                    '		</div>' +
                                    "	</a>" +
                                    "</div>";
                            }
                            // Find the h2 element with the class "h2-icon"
                            h2Element = $('.content-block[name="top-posts"] h2.h2-icon');

                            // Check and append the new sample data button element to the h2 element
                            checkAndAppend(h2Element);
                            break;

                        case "top-content-creators":
                            const topContentCreators = generateTopContentCreators();
                            topContentCreators.sort((a, b) => b.count - a.count);

                            for (var i = 0; (i <= 6) && (i < topContentCreators.length); i++) { //display max top 6 creators

                                thumbnailSrc = topContentCreators[i]['profile_pic_url'];
                                var title = "Post";
                                if (topContentCreators[i]['count'] > 1) title = "Posts";

                                html += "<div class='saved-search' data-social-network='" + topContentCreators[i]['social_network'] + "'>" +
                                    "	<a class='saved-search-inner' href='#'>" +
                                    "		<div class='social-network-icon'></div>" +
                                    "		<div class='search-image'>" +
                                    "			<img class='' src='" + thumbnailSrc + "'>" +
                                    '		</div>' +
                                    '		<div class="thumbnail-overlay">' +
                                    '			<span class="thumbnail-title"> ' + topContentCreators[i]['count'] + '</span>' +
                                    '			<span class="thumbnail-subtitle"> ' + title + '</span>' +
                                    "		</div>" +
                                    '		<div class="saved-search-text">' +
                                    '			<div class="username"> @' + topContentCreators[i]['username'] + '</div>' +
                                    '			<div class="screen-name"> @' + topContentCreators[i]['screen_name'] + '</div>' +
                                    "		</div>" +
                                    "	</a>" +
                                    "</div>";
                            }
                            // Find the h2 element with the class "h2-icon"
                            h2Element = $('.content-block[name="top-content-creators"] h2.h2-icon');

                            // Check and append the new sample data button element to the h2 element
                            checkAndAppend(h2Element);
                            break;

                        case "top-hashtags":
                            const topHashtags = generateTopHashtags();
                            topHashtags.sort((a, b) => b.count - a.count);

                            for (var i = 0; (i <= 20) && (i < topHashtags.length); i++) { //display max top 20 hashtags

                                var hashtagHref = "javascript:void(0);";

                                html += "<div class='top-hashtag'>" +
                                    "<a href='" + hashtagHref + "'>" +
                                    " #" + topHashtags[i]['hashtag'] + " (" + topHashtags[i]['count'] + ")" +
                                    "</a>" +
                                    "</div>";
                            }
                            // Find the h2 element with the class "h2-icon"
                            h2Element = $('.content-block[name="top-hashtags"] h2.h2-icon');

                            // Check and append the new sample data button element to the h2 element
                            checkAndAppend(h2Element);
                            break;

                        case "all-posts":

                            const allPosts = generatePosts();
                            for (var i = 0; (i <= 8) && (i < allPosts.length); i++) {
                                mediaHtml = '	<div class="post-inner" style = "height: 307px;">' +
                                    '		<img class="image-fill" src="' + allPosts[i].image_url + '" style = "width: 100%;">' +
                                    '	<div class="post-title">' + allPosts[i].post_title + '</div>' +
                                    '	</div>' +
                                    '	<div class="post-caption"><p>' + allPosts[i].caption + '</p></div>' +
                                    '	<div class="post-meta">' +
                                    '		<div class="post-meta-item" name="date">' +
                                    (allPosts[i].post_status === 'future' ?
                                        'will be published in : ' + allPosts[i].date_diff :
                                        allPosts[i].date_diff) +
                                    '</div>' +
                                    '		<div class="post-meta-item" name="author">' + allPosts[i].author_name + '</div>' +
                                    '	</div>';

                                html += '<div class="saved-post" ' +
                                    'data-post-id="' + allPosts[i].post_id + '" ' +
                                    'data-post-status="' + allPosts[i].post_status + '" ' +
                                    'data-social-network="' + allPosts[i].social_network + '" ' +
                                    'data-pinned="' + allPosts[i].pinned_post + '" ' +
                                    'data-social-id="' + allPosts[i].social_id + '">' +
                                    mediaHtml +
                                    '</div>';
                            }
                            $('h1').html('All Posts (' + allPosts.length + ' Posts)');
                            $('h1').css({
                                'display': 'inline-block'
                            });
                            $('h1').append(sampleDataButton);
                            break;

                        case "all-products":
                            const allProducts = generateAllProducts();
                            // for each product...
                            for (var i = 0; i < allProducts.length; i++) {

                                var p = allProducts[i];
                                html += '<div  data-product-id="' + p['product_id'] + '" data-product-sku="' + p['sku'] + '" data-client-id="' + p['client_id'] + '" class="product-item">' +
                                    '   <img src="' + p['image_link'] + '">' +
                                    '   <div class="product-title">' + p['title'] + '</div>' +
                                    '   <div class="regions"></div>' +
                                    '</div>';

                            }
                            $('h1').html('All Products (' + allProducts.length + ')');
                            $('h1').css({
                                'display': 'inline-block'
                            });
                            $('h1').append(sampleDataButton);
                            break;

                        case "all-reviews":
                            const reviews = generateReviews();

                            // create header HTML
                            // var reviewsHtml = '<div class="reviews-header">' +
                            //     '	<div class="reviewed-product">Product</div>' +
                            //     '	<div class="review-date">Date</div>' +
                            //     '	<div class="reviewer">Reviewer</div>' +
                            //     '	<div class="review-detail">Review Detail</div>' +
                            //     '	<div class="review-actions"></div>' +
                            //     '</div>';

                            // $('.content-block[name=all-reviews] .content-block-body').append(reviewsHtml);

                            // for each review...
                            for (var i = 0; i < reviews.length; i++) {


                                // format date
                                var date = new Date(reviews[i]['created']);
                                var dateStr = date.getDate() + " " + monthNames[date.getMonth()].substring(0, 3) + " "
                                    + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

                                // create rating HTML
                                var ratingHtml = "";
                                for (var j = 0; j < 5; j++) {
                                    var starHtml = '<div class="rating-star"><i></i></div>';
                                    if (j < reviews[i]['rating']) starHtml = '<div class="rating-star active"><i></i></div>';
                                    ratingHtml += starHtml;
                                }

                                // create review HTML
                                html += "<div class='review' data-review-id='" + reviews[i]['id'] + "'" +
                                    "			data-product-id='" + reviews[i]['product_id'] + "'" +
                                    "			data-rating='" + reviews[i]['rating'] + "'" +
                                    "			data-review-status='" + reviews[i]['status'] + "'>" +
                                    "	<div class='reviewed-product'></div>" +
                                    "	<div class='review-date'>" + dateStr + "</div>" +
                                    "	<div class='reviewer'>" + reviews[i]['reviewer_name'] + "</div>" +
                                    "	<div class='review-detail'>" +
                                    "		<div class='rating'><div class='review-stars'>" + ratingHtml + "</div></div>" +
                                    "		<div class='review-title'>" + reviews[i]['title'] + "</div>" +
                                    "		<div class='review-description'>" + reviews[i]['description'] + "</div>" +
                                    "	</div>" +
                                    "	<div class='review-actions'>" +
                                    "		<div class='review-status'>" + reviews[i]['status'] + "</div>" +
                                    "		<div class='cta-group'>" +
                                    "			<a class='cta-primary' data-action='update-review-status' data-intent='admin_approved'>Approve</a>" +
                                    "			<a class='cta-secondary' data-action='delete-review'>Delete</a>" +
                                    "			<a class='cta-primary' data-action='update-review-status' data-intent='published'>Approve</a>" +
                                    "			<a class='cta-secondary' data-action='update-review-status' data-intent='flagged'>Flag</a>" +
                                    "		</div>" +
                                    "	</div>" +
                                    "	</div>";
                            }
                            $('h1').html('Review Moderation (' + reviews.length + ')');
                            $('h1').css({
                                'display': 'inline-block'
                            });
                            $('h1').append(sampleDataButton);
                            break;

                        case "reviews-summary-overall-rating":
                                html = ReviewsSummary['overallRating'] ;
                                createChart(ReviewsSummary['chartData']);
                                $('h1').css({ 'display': 'inline-block' }).append(`<div class="label-sample-data">SAMPLE DATA</div>`);
                            break;

                        case "reviews-summary-total-reviews":
                                html = ReviewsSummary['totalReviews'] ;
                            break;
                        
                        case "reviews-summary-site-rating":
                                html = ReviewsSummary['siteRating'] ;
                            break;    

                        case "reviews-summary-product-rating":
                                html = ReviewsSummary['productRating'] ;
                            break; 

                        case "latest-reviews":
                            const latestReviews = generateLatestReviews();

                            for (let i = 0; i < Math.min(latestReviews.length, 4); i++) {
                                const review = latestReviews[i];
                                if (review.status === 'published') {
                                    const date = new Date(review.created);
                                    const dateStr = date.getDate() + " " + monthNames[date.getMonth()].substring(0, 3) + " " +
                                        (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" +
                                        (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
                
                                    let ratingHtml = "";
                                    for (let j = 0; j < 5; j++) {
                                        let starHtml = '<div class="rating-star"><i></i></div>';
                                        if (j < review.rating) starHtml = '<div class="rating-star active"><i></i></div>';
                                        ratingHtml += starHtml;
                                    }
                
                                    html += "<div class='review' data-review-id='" + review.id + "'" +
                                        " data-product-id='" + review.product_id + "'" +
                                        " data-rating='" + review.rating + "'" +
                                        " data-review-status='" + review.status + "'>" +
                                        "<div class='review-detail'>" +
                                        "<div class='rating'>" + ratingHtml + "</div>" +
                                        "<div class='review-title'>" + review.title + "</div>" +
                                        "<div class='review-description'>" + review.description + "</div>" +
                                        "</div>" +
                                        "<div class='review-actions'>" +
                                        "<div class='review-status'>" + review.status + "</div>" +
                                        "<div class='cta-group'>" +
                                        "<a class='cta-primary' data-action='update-review-status' data-intent='admin_approved'>Approve</a>" +
                                        "<a class='cta-secondary' data-action='delete-review'>Delete</a>" +
                                        "<a class='cta-primary' data-action='update-review-status' data-intent='published'>Approve</a>" +
                                        "<a class='cta-secondary' data-action='update-review-status' data-intent='flagged'>Flag</a>" +
                                        "</div>" +
                                        "</div>" +
                                        "<div class='review-meta'>" +
                                        "<div class='review-meta-item' name='date-diff'>" + dateStr + "</div>" +
                                        "<div class='review-meta-item' name='reviewer'>" + review.reviewer_name + "</div>" +
                                        "</div>" +
                                        "</div>";
                                }
                            }

                        break;     

                        default:
                            html = `<div class="sample-data"><p>this is a sample data</p><p>Nothing to show</p></div>`;
                    }
                    $(targetClass).append(html);
                    $('.review-actions .cta-group').css({
                        'pointer-events': 'none'
                    });

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                },
                complete: function () { }
            });
        };


    });
}(jQuery));

function noDataPlaceholderGenerator(targetClass, type, title, text, icon, ctaText, ctaLink) {
    return jQuery._noDataPlaceholderGenerator(targetClass, type, title, text, icon, ctaText, ctaLink);
}

function sampleData(targetClass, targetElement) {
    return jQuery._sampleData(targetClass, targetElement);
}