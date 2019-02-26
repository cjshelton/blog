$(document).ready(function() {

    var overlay = document.createElement("div");
    overlay.className = 'code-block-overlay';
    overlay.style.width = "100%";
    overlay.style.height = "100px";
    overlay.style.background = "#005b96";
    overlay.style.opacity = 0.9;
    overlay.style.color = "white";
    overlay.innerHTML = '<span class="abs-centered">Click to reveal code sample</span>';
    overlay.style.position = 'absolute';
    overlay.style.top = '0px';
    overlay.style.left = '0px';

    var intialHeight = 50;

    // Define 'hidden' state in CSS as a class.
    // Initially, add that class through JS to all elements with a specific class - '.code-block-toggle'.
    // Setup a click listener on all elements with the '.code-block-toggle' class which:
    //  - Remove class to 'show' the element.
    //

    // Apply minimised class to all code block initially.
    $('.code-block').addClass('code-block-hidden');
    $('.code-block').append(overlay);

    $('.code-block').click(function() {
        $(this).removeClass('code-block-hidden');
        $(this).find('.code-block-overlay').remove();
    });

});