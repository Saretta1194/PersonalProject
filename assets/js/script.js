/*==========SKILLS TABS===========*/ 
const tabs = document.querySelectorAll('[data-target]'),
      tabContent = document.querySelectorAll('[data-content]')

      tabs.forEach(tab =>{
          tab.addEventListener("click", () => {
            const target = document.querySelector(tab.dataset.target)

            tabContent.forEach(tabContents => {
                tabContents.classList.remove("skills__active")
            })
            target.classList.add('skills__active')

            tabs.forEach(tab => {
                tab.classList.remove("skills__active")
            })
            tab.classList.add('skills__active')

          })
      })
/*==========FILTERS ===========*/ 
document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll(".work__item");
    const workCards = document.querySelectorAll(".work__card");
      
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Rimuove la classe attiva da tutti i bottoni
        filterButtons.forEach(btn => btn.classList.remove("active-work"));
        button.classList.add("active-work");
      
        const filterValue = button.getAttribute("data-filter");
      
        workCards.forEach(card => {
            const category = card.getAttribute("data-category");
            if (filterValue === "all" || category === filterValue) {
            card.style.display = "block";
            } else {
            card.style.display = "none";
            }
            });
          });
        });
      });

    document.querySelectorAll('.work__button').forEach(button => {
        button.addEventListener('click', () => {
        const details = button.nextElementSibling;
      
         
        document.querySelectorAll('.portfolio__item-details').forEach(d => {
            if (d !== details) d.style.display = 'none';
          });
      
        // Toggle 
        if (details.style.display === 'block') {
            details.style.display = 'none';
          } else {
         details.style.display = 'block';
          }
        });
      });

      /*==========SCROLL SECTION ACTIVE ===========*/
      
      window.addEventListener("scroll", () => {
        const sections = document.querySelectorAll("section[id]");
        const scrollY = window.pageYOffset;
      
        sections.forEach(current => {
          const sectionHeight = current.offsetHeight;
          const sectionTop = current.offsetTop - 50;
          const sectionId = current.getAttribute("id");
      
          const navLink = document.querySelector(".nav__link[href*=" + sectionId + "]");
      
          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink.classList.add("active-link");
          } else {
            navLink.classList.remove("active-link");
          }
        });
      });
      
