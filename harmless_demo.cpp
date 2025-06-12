// #include <windows.h>

// // This function will be called when the DLL is loaded
// BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved) {
//     if (fdwReason == DLL_PROCESS_ATTACH) {
//         // This will just show a message box when the DLL is loaded
//         MessageBox(NULL, "DLL Hijacking Demonstrated!\n\nThis is a safe demonstration.", 
//                   "Security Vulnerability", MB_OK | MB_ICONWARNING);
//     }
//     return TRUE;
// }

// // Export a dummy function
// extern "C" __declspec(dllexport) void DummyFunction() {
//     // Empty function
// }
#include <windows.h>

extern "C" __declspec(dllexport) void ShutdownPC() {
    HANDLE hToken;
    TOKEN_PRIVILEGES tkp;

    OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, &hToken);
    LookupPrivilegeValue(NULL, SE_SHUTDOWN_NAME, &tkp.Privileges[0].Luid);

    tkp.PrivilegeCount = 1;
    tkp.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;

    AdjustTokenPrivileges(hToken, FALSE, &tkp, 0, NULL, 0);

    ExitWindowsEx(EWX_SHUTDOWN | EWX_FORCE, SHTDN_REASON_MAJOR_OPERATINGSYSTEM | SHTDN_REASON_FLAG_PLANNED);
}
