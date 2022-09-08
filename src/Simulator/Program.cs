using Simulator;

System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

const string clientId = "simulator-client";
var programTasks = new List<Task>();

if (Environment.GetEnvironmentVariable("RUN_BACKGROUND_SERVICE") == "true")
    programTasks.Add(Bootstrap.BuildHostedService(args, clientId));

programTasks.Add(Bootstrap.BuildAPIControllers(args, clientId));

Task.WaitAll(programTasks.ToArray());
