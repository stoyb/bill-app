/**
 * @jest-environment jsdom
 */

 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import { screen, waitFor } from "@testing-library/dom"
 import mockStore from "../__mocks__/store"
 import { localStorageMock } from "../__mocks__/localStorage.js"
 import { ROUTES_PATH } from "../constants/routes.js"
 import router from "../app/Router.js";
 
 
 jest.mock("../app/store", () => mockStore)
 
 describe("Given I am connected as an employee", () => {
   describe("When I am on NewBill Page", () => {
     describe("when upload file", () => {
       
       function initialisationNewBill(){
         const html = NewBillUI()
         document.body.innerHTML = html
 
          //Mock onNavigate
         const onNavigate = jest.fn(()=>{})
 
         //Mock store
         const store = mockStore
 
         //Create a  user  
         const userObj = {
           type:"Employee",
           email:"employee@test.tld",
           password:"employee",
           status:"connected"
         }
         
         //Mock a localStore with user
         Object.defineProperty(window, 'localStorage', { value: localStorageMock }) //<-- A voir JS
         window.localStorage.setItem('user', JSON.stringify(userObj))
 
         //Création d'un nouveau NewBill
         return new NewBill({document,onNavigate,store,locaStore: window.localStorage})
       }
       
       let aNewBill
       beforeEach(() => {
         aNewBill = initialisationNewBill()
       });
 
       test("Then the file is an extention png or jpeg or jpg ", () => {
         
         //Take the type file imput
         const fileInput = screen.getByTestId('file')
         
         //Mock a jpg file
         const file = new File(['dummy file'], 'test.jpg', {type: 'image/jpg'})
 
         //Create a event onchange
         const event = new Event('change', { bubbles: true })
 
         //Gives input value 
         Object.defineProperty(fileInput, 'files', {
           value: [file]
         })
         
         //Dispatch event
         fileInput.dispatchEvent(event)
         
         // Test de la fonction handleChangeFile
         // retourne -1 si fichier test est autre chose que l'extention attendu  
         // sinon pas de retour 
         expect(aNewBill.handleChangeFile(event)).toBe(undefined)
       })
 
       test("Then the file don't accept other extention than png or jpeg or jpg ", () => {
         
         const fileInput = screen.getByTestId('file')
         
         //Mock a jpg file
         const file = new File(['dummy file'], 'test.pdf', {type: 'application/pdf'})
 
         const event = new Event('change', { bubbles: true })
 
         Object.defineProperty(fileInput, 'files', {
           value: [file]
         })
         
         fileInput.dispatchEvent(event)
         
         expect(aNewBill.handleChangeFile(event)).toBe(-1)
       })
     })
     //Test d'intégration 
     test("POST bill", async () => {
       localStorage.setItem("user", JSON.stringify({ 
         type: "Employee", 
         email: "a@a" 
       }));
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.NewBill)
       await waitFor(() => screen.getAllByText("Envoyer"))
     })
 
     describe("When an error occurs on API", () => {
      test("POST bill fails with 404 message error", async () => {
        try{
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
              window,
              'localStorage',
              { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type:"Employee",
            email:"a@a",
            password:"employee",
            status:"connected"
          }))
          window.onNavigate(ROUTES_PATH.NewBill)
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
          
          const buttonSubmit = screen.getAllByText('Envoyer')  
          buttonSubmit[0].click()
          
          mockStore.bills.mockImplementationOnce(() => {
            return {
              create : (bill) =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }
          })
          
          window.onNavigate(ROUTES_PATH.NewBill)
          await new Promise(process.nextTick);
          const message = screen.queryByText(/Erreur 404/)
          await waitFor(()=>{
            expect(message).toBeTruthy()
          })

        }catch(error){
          console.error(error);
        }
      })
       test("POST bill fails with 500 message error", async () => {
         try{
           jest.spyOn(mockStore, "bills")
 
           Object.defineProperty(
               window,
               'localStorage',
               { value: localStorageMock }
           )
   
           window.localStorage.setItem('user', JSON.stringify({
             type:"Employee",
             email:"a@a",
             password:"employee",
             status:"connected"
           }))
   
           window.onNavigate(ROUTES_PATH.NewBill)
           
           const root = document.createElement("div")
           root.setAttribute("id", "root")
           document.body.appendChild(root)
           router()
           
           const buttonSubmit = screen.getAllByText('Envoyer')  
           buttonSubmit[0].click()
           
           mockStore.bills.mockImplementationOnce(() => {
             return {
               create : (bill) =>  {
                 return Promise.reject(new Error("Erreur 500"))
               }
             }
           })
           
           window.onNavigate(ROUTES_PATH.NewBill)
           await new Promise(process.nextTick);
           const message = screen.queryByText(/Erreur 500/)
           await waitFor(()=>{
             expect(message).toBeTruthy()
           })
 
         }catch(error){
           console.error(error);
         }
       })
     })
   })
 })