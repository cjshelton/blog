---
layout: post
title:  "SOLID Design Principles in Software Development"
comments-enabled: true
---

## Introduction

<!-- excerpt-start -->
SOLID design principles are a fundamental set of guidelines for any software developer. Beyond the simplicity of a &#39;Hello World&#39; application, code bases naturally become very complex, involve lots of moving parts and are worked on by teams of developers. Because of this, it is important that the software we create is of good quality, is maintainable, readable, predictable and testable. The SOLID design principles help us achieve this.
<!-- excerpt-end -->

These principles are covered in depth all over the internet, but aren't always explained in the clearest of ways, and in my opinion, miss out some key ways that these principles can be followed and implemented. I hope to add some clarity, and from experience, give my take on how they can be implemented.

I will focus mainly on examples in C&#35;, but these principles can always be applied in some way to almost any language.

## Single Responsibility Principle

The Single Responsibility Principle (SRP) encourages classes to only have one specific purpose; to provide only one distinct area of functionality and one reason to require a change. It's often hard to define what this means, and there is no clear definition; it very much depends on what you&#39;re actually developing.

A clear example I like to use is with logging. Logging is critical to any application, and should be performed across various levels of the system architecture. It is against the SRP to define how logging should be performed in a class which is also responsible for performing complex business calculations, or handling incoming HTTP requests, for example.

Below is an example Controller class with an Action which show's the user's profile. This is somewhat of a trivial example showing multiple violations of the SRP.

{:.code-block}
```
public class AccountController : Controller
{
    private readonly ApplicationDbContext _db;

    public AccountController(ApplicationDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));    
    }

    [Authorize]
    public async Task<IActionResult> Profile()
    {
        try
        {
            // Get logged in user from the Request.
            string userId = this.User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Query the DB for the user's details.
            IdentityUser user = await this._db.Users.FindAsync(userId);

            // Check user was found. 
            if (user == null) throw new Exception("User not found.");

            // Convert IdentityUser to ProfileViewModel.
            ProfileViewModel viewModel = new ProfileViewModel
            {
                UserName = user.UserName,
                PhoneNumber = user.PhoneNumber,
                Email = user.Email
            };

            return View(viewModel);
        }
        catch(Exception ex)
        {
            LogExceptionToFile(ex);

            throw ex;
        }
    }

    private void LogExceptionToFile(Exception ex)
    {
        const string LOG_FILE_PATH = "path/to/file";

        using (StreamWriter file = System.IO.File.AppendText(LOG_FILE_PATH)) 
        {
            file.WriteLine(ex.ToString());
        }
    }
}
```

Controllers should be limited to authorising HTTP requests, delegating processing to its dependencies, and preparing a suitable response - this can be seen as their &#39;single&#39; area of responsibility. This example, however, sees the Controller be responsible for:

1. Obtaining the user's ID.
1. Querying the data store for the user's details.
1. Validating the user record returned.
1. Building up a View Model for the user's profile.
1. Error handling.
1. Logging errors to a file.
1. Returning the response.

The SRP can be applied to the example above in the following ways:

1. Create an abstraction for obtaining the information from the user's claims, with a method specifically for obtaining the user's ID. This abstraction simplifies this code and promotes reuse across different classes. Importantly, if the method of obtaining the user's ID ever changes, the Controller needn't care, only the abstraction needs to change.

1. Create another abstraction for data access methods. Following the Repository pattern, a User repository can be created which can be used for handling all User related data access and validation. The major benefit of this is the Controller doesn't need to understand how data access is performed. Using the repository abstraction, Entity Framework could be swapped out for Dapper and pure ADO.NET, and the Controller doesn't need to change.

1. Depending on how often the `ProfileViewModel`{:.code-inline} is instantiated, a factory class could be created which is responsible for building these objects. The benefit here being, that if the definition of `ProfileViewModel`{:.code-inline} ever changed, then it only needs to be changed in the one place it gets instantiated &mdash; the factory class.

1. Use global error handling which logs the exception and directs the user towards a user-friendly error page. Generic error handling is very boilerplate code and does not need to be defined in every Controller class. If the process of handling generic errors ever changes, the Controllers do not need to change their behaviour.

1. Create a further abstraction for writing log messages. There should be only one class responsible for knowing how to store log messages, Controllers can then use this logging abstraction without needing to know the detail. If the logging mechanism  ever needs to be changed, then this can be done in one place and not in every class. Thankfully, this is made easier in .NET Core with the built-in logging interfaces.

Applying these changes turns the code into something like the following. Depending on the complexity of your application, further abstractions could be performed so the Controller has fewer dependencies (and fewer things to do).

{:.code-block}
```
public class AccountController : Controller
{
    private readonly IUserViewModelFactory _viewModelFactory;
    private readonly IUserRepository _userRepository;
    private readonly IUserManager _userManager;

    public AccountController(IUserViewModelFactory viewModelFactory, IUserRepository userRepository, IUserManager userManager)
    {
        _viewModelFactory = viewModelFactory ?? throw new ArgumentNullException(nameof(viewModelFactory));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    [Authorize]
    public async Task<IActionResult> Profile()
    {
        string userId = _userManager.GetUserId(this.User);

        IdentityUser user = await _userRepository.GetUserAsync(userId);

        ProfileViewModel viewModel = _viewModelFactory.BuildViewModel(user);

        return View(viewModel);
    }
}
```

By abstracting out distinct areas of functionality like this, it encourages code reuse and makes the application more maintainable; fewer code changes are needed when requirements change, simplifying the code review process and minimising the chance of code regression. The code also becomes more self-documenting, showing intent by using these abstractions.

Some indicators which highlight that you may have violated the SRP include:
- Code duplication across multiple classes.
- Complex and hard to understand classes. This is a tricky one because some classes may be complex in nature, but it's always worth checking to see if you can perform any abstractions to simplify the code any further.
- Class methods whose names cover multiple actions. For example, `CreateAndSetUser(...)`{:.code-inline}.

## Open/Closed Principle

The Open/Closed Principle (OCP) states that code should be written so that it is open for extension and closed for modification.

Extension here means that the code should be flexible enough to be reused without requiring a code change. Modifications to existing code, especially that which is in production, carries risks and should be minimised. Existing code will have already been tested and should be stable; changes to this code may introduce regressions and result in extra development effort.

Code which adheres to the OCP not only protects the code against risk modifications, it promotes reuse and a simpler architecture which is easier to maintain in the future.

From experience, there is no one way to apply the OCP. I have found the following to be practical ways of designing code which flexible for re-use:
- Interfacing and constructor injection (for OO languages)
- Passing in by parameters rather than hard coding
- Polymorphism.
- Extension methods


These principles are very much guidelines for ways of producing better quality software. It is not always possible to follow them literally, and there is no prescriptive way to apply these principles to all languages and situations; it's up to us as developers to adapt the principles and get the most benefit from them applying them. 