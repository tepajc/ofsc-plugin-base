function drawSampleSignature(canvas)
{
    if (!canvas.getContext)
    {
        return;
    }
 
    var c = canvas.getContext('2d');
 
    c.fillStyle="#ffffff";
    c.strokeStyle = "#000000";
    c.lineWidth = 1.5;
    c.lineCap = "round";
 
    // White background
    c.rect(0, 0, 320, 240);
    c.fill();
 
    c.beginPath();
    // C
    c.moveTo(38, 57);
    c.bezierCurveTo(38, 57, 39, 78, 44, 77);
    c.bezierCurveTo(50, 76, 58, 21, 43, 21);
    c.bezierCurveTo(26, 21, 20, 119, 35, 120);
    c.bezierCurveTo(50, 120, 68, 91, 77, 65);
    // usto
    c.moveTo(66, 76);
    c.bezierCurveTo(66, 76, 67, 112, 71, 111);
    c.bezierCurveTo(75, 110, 80, 77, 81, 76);
    c.bezierCurveTo(82, 74, 78, 100, 84, 100);
    c.bezierCurveTo(87, 100, 95, 73, 95, 70);
    c.bezierCurveTo(96, 66, 79, 63, 90, 84);
    c.bezierCurveTo(95, 94, 100, 90, 111, 102);
    c.bezierCurveTo(115, 107, 96, 121, 96, 118);
    c.bezierCurveTo(97, 108, 108, 101, 113, 86);
    c.bezierCurveTo(118, 72, 117, 38, 118, 45);
    c.bezierCurveTo(119, 52, 126, 114, 129, 111);
    c.bezierCurveTo(130, 110, 121, 88, 114, 89);
    c.bezierCurveTo(108, 89, 133, 87, 138, 77);
    c.bezierCurveTo(142, 66, 148, 76, 148, 81);
    c.bezierCurveTo(149, 86, 149, 95, 145, 95);
    c.bezierCurveTo(137, 95, 138, 77, 138, 77);
    // mer
    c.moveTo(149, 87);
    c.bezierCurveTo(149, 87, 151, 72, 153, 71);
    c.bezierCurveTo(155, 71, 158, 91, 159, 95);
    c.bezierCurveTo(160, 99, 158, 68, 161, 69);
    c.bezierCurveTo(164, 69, 161, 85, 164, 84);
    c.bezierCurveTo(166, 84, 164, 66, 166, 67);
    c.bezierCurveTo(168, 67, 170, 89, 176, 87);
    c.bezierCurveTo(182, 86, 186, 52, 180, 52);
    c.bezierCurveTo(175, 51, 173, 84, 194, 89);
    c.bezierCurveTo(209, 93, 190, 64, 202, 61);
    c.bezierCurveTo(209, 60, 208, 72, 213, 71);
    c.bezierCurveTo(215, 71, 212, 61, 214, 60);
    c.bezierCurveTo(215, 58, 208, 100, 215, 98);
    c.bezierCurveTo(222, 95, 243, 64, 245, 57);
    // S
    c.moveTo(137, 131);
    c.bezierCurveTo(143, 122, 123, 106, 117, 127);
    c.bezierCurveTo(112, 147, 131, 157, 138, 161);
    c.bezierCurveTo(152, 169, 138, 181, 126, 184);
    c.bezierCurveTo(116, 187, 123, 179, 123, 179);
    // i
    c.moveTo(148, 149);
    c.bezierCurveTo(148, 149, 147, 152, 149, 153);
    c.moveTo(152, 158);
    c.bezierCurveTo(156, 167, 150, 183, 153, 184);
    // gna
    c.moveTo(170, 160);
    c.bezierCurveTo(170, 160, 166, 151, 162, 152);
    c.bezierCurveTo(158, 153, 160, 168, 164, 168);
    c.bezierCurveTo(168, 168, 174, 165, 170, 152);
    c.bezierCurveTo(167, 140, 181, 187, 180, 199);
    c.bezierCurveTo(180, 215, 164, 219, 164, 202);
    c.bezierCurveTo(165, 194, 182, 168, 183, 154);
    c.bezierCurveTo(184, 148, 176, 184, 182, 184);
    c.bezierCurveTo(187, 185, 184, 159, 186, 161);
    c.bezierCurveTo(188, 162, 189, 175, 193, 174);
    c.bezierCurveTo(196, 173, 195, 156, 199, 155);
    c.bezierCurveTo(202, 153, 207, 164, 205, 169);
    c.bezierCurveTo(203, 175, 196, 171, 196, 163);
    c.bezierCurveTo(197, 155, 208, 169, 207, 155);
    c.bezierCurveTo(207, 143, 211, 171, 215, 169);
    c.bezierCurveTo(218, 167, 215, 153, 216, 153);
    // t
    c.moveTo(218, 132);
    c.bezierCurveTo(222, 127, 222, 174, 227, 175);
    c.bezierCurveTo(231, 176, 233, 171, 233, 171);
    // -ure
    c.moveTo(212, 156);
    c.bezierCurveTo(212, 156, 231, 143, 234, 144);
    c.bezierCurveTo(236, 144, 234, 162, 238, 162);
    c.bezierCurveTo(243, 162, 242, 145, 244, 146);
    c.bezierCurveTo(247, 146, 247, 158, 249, 158);
    c.bezierCurveTo(251, 158, 249, 137, 251, 138);
    c.bezierCurveTo(254, 139, 252, 142, 256, 143);
    c.bezierCurveTo(259, 143, 254, 168, 269, 161);
    c.bezierCurveTo(284, 154, 271, 127, 268, 126);
    c.bezierCurveTo(266, 125, 260, 139, 274, 157);
    c.bezierCurveTo(288, 175, 298, 173, 298, 173);
    c.stroke();
}