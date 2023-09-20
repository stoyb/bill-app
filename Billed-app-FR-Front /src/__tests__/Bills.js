/**
 * @jest-environment jsdom
 */

 import {screen, waitFor} from "@testing-library/dom"
 import Bills from "../containers/Bills.js";
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import {localStorageMock} from "../__mocks__/localStorage.js";
 import mockStore from "../__mocks__/store"
 
 import router from "../app/Router.js";
 import userEvent from "@testing-library/user-event";
 import { ROUTES_PATH } from "../constants/routes.js";
 
 jest.mock("../app/store", () => mockStore)
 $.fn.modal = jest.fn(); 
 
 describe("Given I am connected as an employee", () => {
 
   function initialisationBills(){
     document.body.innerHTML = BillsUI({ data: bills })
 
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
     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
     window.localStorage.setItem('user', JSON.stringify(userObj))
 
     //Creation of Bills
     return new Bills({document, onNavigate, store, localStorage })
   }
   
   describe("When I am on Bills Page", () => {
     let theBills
     beforeEach(() =>{
       theBills = initialisationBills()
     })
   
     test("Then bill icon in vertical layout should be highlighted", async () => {
 
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.Bills)
       await waitFor(() => screen.getByTestId('icon-window'))
       const windowIcon = screen.getByTestId('icon-window')
       //to-do write expect expression
       expect(windowIcon.classList.contains("active-icon")).toBe(true)
     })
     test("Then bills should be ordered from earliest to latest", () => {
       document.body.innerHTML = BillsUI({ data: bills })
       const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
       const antiChrono = (a, b) => ((a < b) ? 1 : -1)
       const datesSorted = [...dates].sort(antiChrono)
       expect(dates).toEqual(datesSorted)
     })
     // Check handleClickIconEye()
      describe("When click on eye-icon of a bill", ()=>{
       test("Then render a modal",async()=>{
         const eye_icons = screen.getAllByTestId("icon-eye")
         userEvent.click(eye_icons[0])
         await waitFor(() =>{
           expect($('#modaleFile').find(".modal-body").innerHTML != '').toBe(true) 
         })
       })
     })

     describe("When I am on Bills Page", () => {
        let mockDocument;
        let mockOnNavigate;
        let mockLocalStorage;
        beforeEach(() => {
          mockDocument = {
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(),
          };
          mockOnNavigate = jest.fn();
          mockLocalStorage = {
            getItem: jest.fn(),
          };
        });
        // Check getBills()
          test("Then gets and format bills", async () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
              type: 'Employee', email: "a@a"
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByText("Mes notes de frais"))
            expect(screen.getByText("Mes notes de frais")).toBeTruthy()
            const bills = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage, })
            const mockGetBills = jest.fn(() => bills.getBills())
            const mockedData = await mockGetBills()
            expect(mockGetBills).toHaveBeenCalled()
            expect(mockedData.length).toBe(4)
          });
        })
 
     // Test d'intégration -> GET
     describe("When I navigate to Bills Page", () => {
       test("fetches bills from mock API GET", async () => {
         localStorage.setItem("user", JSON.stringify({ 
           type:"Employee",
           email:"a@a",
           password:"employee",
           status:"connected"
         }));
         const root = document.createElement("div")
         root.setAttribute("id", "root")
         document.body.append(root)
         router()
         window.onNavigate(ROUTES_PATH.Bills)
         await waitFor(() => {
           expect(screen.getByText("accepted")).toBeTruthy()
           expect(screen.getAllByText("pending")).toBeTruthy()
           expect(screen.getAllByText("refused")).toBeTruthy()
         })
       })
       
       describe("When an error occurs on API", () => {
         beforeEach(() => {
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
           const root = document.createElement("div")
           root.setAttribute("id", "root")
           document.body.appendChild(root)
           router()
         })
         
         test("fetches bills from an API and fails with 404 message error", async () => {
     
           mockStore.bills.mockImplementationOnce(() => {
             return {
               list : () =>  {
                 return Promise.reject(new Error("Erreur 404"))
               }
             }})
           window.onNavigate(ROUTES_PATH.Bills)
           await new Promise(process.nextTick);
           const message = await screen.getByText(/Erreur 404/)
           expect(message).toBeTruthy()
         })
     
         test("fetches messages from an API and fails with 500 message error", async () => {
     
           mockStore.bills.mockImplementationOnce(() => {
             return {
               list : () =>  {
                 return Promise.reject(new Error("Erreur 500"))
               }
             }})
     
           window.onNavigate(ROUTES_PATH.Bills)
           await new Promise(process.nextTick);
           const message = await screen.getByText(/Erreur 500/)
           expect(message).toBeTruthy()
         })
       })
     })
   })
 })

