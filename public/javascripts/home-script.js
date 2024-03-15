gsap.to(".nav", {
    backgroundColor: "#000",//camel case me likkh ke css ki koi bhi property ok access kr skte hai....
    duration: 0.5,
    height: "90px",
    scrollTrigger: {
        trigger: ".nav",
        scroller: "body",
        // markers: true,
        start: "top -10%",
        end: "top -11%",
        scrub: 0.8      // delay:1   it is for delay,No need of writing seconds and all.....   -->scrub is used to implement on scrolling in given time 

    }
})
gsap.to("#main", {
    backgroundColor: "#000",
    scrollTrigger : {
        trigger : "#main",
        scroller : "body",
        // markers :true,
        start : "top -40%",end :"top -90%",
        scrub : 2  //it is used to also act in loop,applied animation act accordingly in loop.
    }
})
let crsr = document.querySelector('#cursor')
document.addEventListener("mousemove",function(dets){
    crsr.style.left = dets.x+16 + "px" 
    crsr.style.top = dets.y + "px"

})
let crbr = document.querySelector('#cursor-blur')
document.addEventListener("mousemove",function(dets){
    crbr.style.left = dets.x - 150 +16 + "px"
    crbr.style.top = dets.y - 150 + "px"

})
var h4all = document.querySelectorAll(".nav h4")
h4all.forEach(function(elem){
    elem.addEventListener("mouseenter",function(){
        crsr.style.scale = 2.5
        crsr.style.border = "0.1px solid #fff"
        crsr.style.backgroundColor = "transparent"
    })
    elem.addEventListener("mouseleave",function(){
        crsr.style.scale = 1
        crsr.style.border = "0px solid #95C11E"
        crsr.style.backgroundColor = "#95C11E"
    })
})
gsap.from("#about-us img,#about-us-in",{
    y:80,
    opacity:0,
    duration:2,
    stagger:0.2234, // stagger ka matlab hai ek ek krke elements ayenge ek tarike se delay dalne ka kaam krta hai !!!!!! bina iske 3 elements jo hai mere wo sath me hi ayenge 
    scrollTrigger:{
        trigger:"#about-us",
        scroller:"body",
        // markers:true,
        start:"top 80%",
        end:"top 68%",
        scrub:3.4

    }
})
gsap.from(".cards",{
    scale:0.8,
    opacity:0,
    duration:1,
    // stagger:0.1, // stagger ka matlab hai ek ek krke elements ayenge ek tarike se delay dalne ka kaam krta hai !!!!!! bina iske 3 elements jo hai mere wo sath me hi ayenge 
    scrollTrigger:{
        trigger:".cards",
        scroller:"body",
        // markers:true,
        start:"top 80%",
        end:"top 68%",
        scrub:2
    }
})
gsap.from("#colon1",{
    y:-70,
    x:-70,
    scrollTrigger :{
        trigger:"#colon1",
        scroller:"body",
        // markers : true,
        start:"top 50%",
        end: "top 47%",
        scrub : 2.5
    }
})
gsap.from("#colon2",{
    y:70,
    x:70,
    scrollTrigger :{
        trigger:"#colon1",
        scroller:"body",
        // markers : true,
        start:"top 50%",
        end: "top 47%",
        scrub : 2.5
    }
})
gsap.from("#page4 h1",{
    y:75,
    scrollTrigger:{
        trigger:"#page4 h1",
        scroller:"body",
        // markers:true,
        start:"top 75%",
        end : 'top 70%',
        scrub:3
    }

})

document.addEventListener("DOMContentLoaded", function() {
    const arrow = document.getElementById('arrow');
    arrow.addEventListener('click', function() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    });
});
