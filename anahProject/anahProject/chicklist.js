let selectedEmoji = "☀️"; // الإيموجي الافتراضي
let taskList = document.getElementById('taskList');
let startChallengeBtn = document.getElementById('startChallengeBtn');
let newTaskContainer = document.getElementById('newTaskContainer');
let saveTaskBtn = document.getElementById('saveTaskBtn');

// عند الضغط على زر "ابدأ تحديك اليوم"
startChallengeBtn.onclick = function() {
    newTaskContainer.style.display = "block";  // إظهار نافذة إضافة المهمة
};

// حفظ المهمة
saveTaskBtn.onclick = function() {
    let taskDescription = document.getElementById("taskDescription").value;
    let taskTime = document.getElementById("taskTime").value;

    if (taskDescription && taskTime) {
        // إنشاء عنصر المهمة
        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card");

        // إضافة حالة المهمة: مكتملة أو غير مكتملة
        let taskStatus = "pending";  // الحالة الافتراضية

        taskCard.innerHTML = `
            <div class="task-details">
                <div class="emoji">${selectedEmoji}</div>
                <div class="task-text">
                    <div class="time">${taskTime}</div>
                    <div class="description">${taskDescription}</div>
                </div>
            </div>
            <input type="checkbox" class="task-checkbox" />
            <button class="edit-btn">تعديل</button>
            <button class="delete-btn">حذف</button>
        `;

        taskCard.querySelector("input").onclick = function () {
            if (taskCard.querySelector("input").checked) {
                taskCard.classList.remove("pending");
                taskCard.classList.add("completed");
            } else {
                taskCard.classList.remove("completed");
                taskCard.classList.add("pending");
            }
        };

        // تعديل المهمة
        taskCard.querySelector(".edit-btn").onclick = function () {
            document.getElementById("taskDescription").value = taskDescription;
            document.getElementById("taskTime").value = taskTime;
            newTaskContainer.style.display = "block";  // إظهار نافذة التعديل
            taskCard.remove(); // إزالة المهمة من القائمة
        };

        // حذف المهمة
        taskCard.querySelector(".delete-btn").onclick = function () {
            taskCard.remove(); // إزالة المهمة من القائمة
        };

        taskList.appendChild(taskCard);
        newTaskContainer.style.display = "none";  // إخفاء نافذة إضافة المهمة بعد الحفظ
    }
};

// اختيار الإيموجي
function selectEmoji(emoji) {
    selectedEmoji = emoji;
}
